require('dotenv').config({ path: '.env' })
import '../extensions/Error'

import { left, right, isLeft, isRight } from 'fp-ts/lib/Either'
import { MongoClient } from 'mongodb'
import * as Pino from 'pino'

import { Configuration } from '../configuration'
import { encrypt } from '../helpers/crypto'
import { loadConfigurationWithDefaults } from '../loadConfiguration'
import { loggingConfigurationToPinoConfiguration } from '../utils/Logging/Logging'
import { Vault } from '../utils/Vault/Vault'

async function migratePrivateKeys() {
  const configuration: Configuration = loadConfigurationWithDefaults()
  const logger = Pino(loggingConfigurationToPinoConfiguration(configuration))

  logger.info('Running Frost API Migration — Private Keys')
  logger.info(configuration, 'Configuration')

  const vaultConfiguration = {
    token: configuration.vaultToken,
    endpoint: configuration.vaultUrl,
    apiVersion: configuration.vaultApiVersion,
  }

  logger.info(vaultConfiguration, 'vaultConfiguration')

  try {
    Vault.config(vaultConfiguration)
    await Vault.mountAuthTune()
  } catch (e) {
    logger.fatal(e, 'Error with Vault')
    return
  }

  const mongoClient = await MongoClient.connect(configuration.mongodbUrl)
  const dbConnection = await mongoClient.db()
  const accountCollection = dbConnection.collection('accounts')

  const query = { privateKey: { $regex: /^vault/ } }

  const accounts = await accountCollection.find(query).toArray()

  logger.info(
    { count: accounts.length, emails: accounts.map(_ => _.email) },
    'Found accounts with Vault-encrypted private key.',
  )

  const decryptedAccounts = await Promise.all(accounts.map(async account => {
    try {
      const privateKey = await Vault.decrypt(account.privateKey)
      return right({
        _id: account._id,
        email: account.email,
        privateKey,
        vaultEncryptedPrivateKey: account.privateKey,
      })
    } catch (error) {
      return left({
        _id: account._id,
        email: account.email,
        vaultEncryptedPrivateKey: account.privateKey,
        error,
      })
    }
  }))

  const failures = decryptedAccounts.filter(isLeft).map(_ => _.left)
  const successes = decryptedAccounts.filter(isRight).map(_ => _.right)

  logger.info({ failureCount: failures.length, successCount: successes.length, successes, failures })

  for (const { _id, email, privateKey, vaultEncryptedPrivateKey } of successes) {
    logger.info({ email }, 'Encrypting account...')
    const encryptedPrivateKey = encrypt(privateKey, configuration.privateKeyEncryptionKey)
    logger.info(
      {
      email,
      privateKey,
      vaultEncryptedPrivateKey,
      encryptedPrivateKey,
      },
      'Migrating one private key...',
    )
    await accountCollection.updateOne({ _id }, { $set: { privateKey: encryptedPrivateKey } })
    logger.info(
      {
        email,
        privateKey,
        vaultEncryptedPrivateKey,
        encryptedPrivateKey,
      },
      'Migrated one private key.',
    )
  }

  await mongoClient.close()

  logger.info('Finished migrating private keys!')

}

// tslint:disable: no-console
migratePrivateKeys().catch(console.error)
