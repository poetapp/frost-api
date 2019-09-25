require('dotenv').config({ path: '.env' })
import '../extensions/Error'

import { left, right, isLeft, isRight } from 'fp-ts/lib/Either'
import { flow } from 'fp-ts/lib/function'
import { MongoClient } from 'mongodb'
import * as Pino from 'pino'

import { Configuration } from '../configuration'
import { decrypt, encrypt } from '../helpers/crypto'
import { loadConfigurationWithDefaults } from '../loadConfiguration'
import { loggingConfigurationToPinoConfiguration } from '../utils/Logging/Logging'
import { Vault } from '../utils/Vault/Vault'

interface Token {
  readonly token: string
}

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

  const encryptWithKey = encrypt(configuration.privateKeyEncryptionKey)
  const decryptWithKey = decrypt(configuration.privateKeyEncryptionKey)

  const decryptBackwardsCompatible = (plaintext: string) =>
    plaintext.startsWith('vault')
      ? Vault.decrypt(plaintext)
      : decryptWithKey(plaintext)

  const encryptApiToken = flow(tokenObjectToToken, encryptWithKey, tokenToTokenObject)

  const decryptApiTokens = async (tokens: ReadonlyArray<Token>): Promise<ReadonlyArray<Token>> =>
    Promise.all(tokens.map(tokenObjectToToken).map(decryptBackwardsCompatible)).then(tokensToTokenObjects)

  const mongoClient = await MongoClient.connect(configuration.mongodbUrl)
  const dbConnection = await mongoClient.db()
  const accountCollection = dbConnection.collection('accounts')

  const accounts = await accountCollection.find({}).toArray()

  logger.info(
    { count: accounts.length, emails: accounts.map(_ => _.email) },
    'Loaded all accounts.',
  )

  const decryptedAccounts = await Promise.all(accounts.map(async account => {
    try {
      const privateKey = await decryptBackwardsCompatible(account.privateKey)
      const apiTokens = await decryptApiTokens(account.apiTokens || [])
      const testApiTokens = await decryptApiTokens(account.testApiTokens || [])
      return right({
        _id: account._id,
        email: account.email,
        encryptedPrivateKey: account.privateKey,
        privateKey,
        encryptedApiTokens: account.apiTokens,
        apiTokens,
        encryptedTestApiTokens: account.testApiTokens,
        testApiTokens,
      })
    } catch (error) {
      return left({
        _id: account._id,
        email: account.email,
        encryptedPrivateKey: account.privateKey,
        encryptedApiTokens: account.apiTokens,
        encryptedTestApiTokens: account.testApiTokens,
        error,
      })
    }
  }))

  const failures = decryptedAccounts.filter(isLeft).map(_ => _.left)
  const successes = decryptedAccounts.filter(isRight).map(_ => _.right)

  logger.error({ failureCount: failures.length, failures }, 'Decryption failures')
  logger.info({ successCount: successes.length, successes }, 'Decryption successes')

  const reencryptedAccounts = await Promise.all(successes.map(async decryptedAccount => {
    const { _id, email, privateKey, encryptedPrivateKey, apiTokens, testApiTokens } = decryptedAccount
    try {
      const reencryptedPrivateKey = encryptWithKey(privateKey)
      const reencryptedApiTokens = apiTokens.map(encryptApiToken)
      const reencryptedTestApiTokens = testApiTokens.map(encryptApiToken)
      await accountCollection.updateOne({ _id }, { $set: {
          privateKey: reencryptedPrivateKey,
          apiTokens: reencryptedApiTokens,
          testApiTokens: reencryptedTestApiTokens,
        }})
      return right({
        _id,
        email,
        encryptedPrivateKey,
        privateKey,
        apiTokens,
        testApiTokens,
        reencryptedPrivateKey,
        reencryptedApiTokens,
        reencryptedTestApiTokens,
      })
    } catch (error) {
      return left({
        _id,
        email,
        encryptedPrivateKey,
        privateKey,
        apiTokens,
        testApiTokens,
        error,
      })
    }
  }))

  const reencryptionFailures = reencryptedAccounts.filter(isLeft).map(_ => _.left)
  const reencryptionSuccesses = reencryptedAccounts.filter(isRight).map(_ => _.right)

  logger.error({ failureCount: reencryptionFailures.length, reencryptionFailures }, 'Reecryption failures')
  logger.info({ successCount: reencryptionSuccesses.length, reencryptionSuccesses }, 'Reecryption successes')

  await mongoClient.close()

  logger.info('Finished migrating private keys!')

}

const tokenToTokenObject = (token: string): Token => ({ token })
const tokenObjectToToken = ({ token }: Token): string => token
const tokensToTokenObjects = (tokens: ReadonlyArray<string>): ReadonlyArray<Token> => tokens.map(tokenToTokenObject)

// tslint:disable: no-console
migratePrivateKeys().catch(console.error)
