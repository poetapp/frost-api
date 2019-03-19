import { createIssuerFromPrivateKey } from '@po.et/poet-js'
import * as Pino from 'pino'

import { Configuration } from '../configuration'
import { MongoDB } from '../databases/mongodb/mongodb'
import { loadConfigurationWithDefaults } from '../loadConfiguration'
import { Account } from '../modules/Accounts/Accounts.model'
import { loggingConfigurationToPinoConfiguration } from '../utils/Logging/Logging'
import { Vault } from '../utils/Vault/Vault'

import '../extensions/Error'

require('dotenv').config({ path: '.env' })

async function main() {
  const configuration: Configuration = loadConfigurationWithDefaults()
  const logger = Pino(loggingConfigurationToPinoConfiguration(configuration))

  logger.info('Running Migration: Issuer ID')
  logger.info({ configuration })

  const configurationVault = {
    token: configuration.vaultToken,
    endpoint: configuration.vaultUrl,
    apiVersion: configuration.vaultApiVersion,
  }

  try {
    Vault.config(configurationVault)
    await Vault.mountAuthTune()
  } catch (e) {
    logger.fatal(e, 'Error with Vault')
    return
  }

  const configurationMongoDB = configurationToMongoDB(configuration)

  const mongoDB = await MongoDB(configurationMongoDB).start()

  const accountToIssuer = async (encryptedPrivateKey: string) => {
    const privateKey = await Vault.decrypt(encryptedPrivateKey)
    return createIssuerFromPrivateKey(privateKey)
  }

  const accounts = await Account.find({ issuer: { $exists: false } })

  logger.info(`Found ${accounts.length} account(s) that match the criteria.`)

  for (const account of accounts as any) {
    const { email, privateKey } = account
    try {
      const issuer = await accountToIssuer(privateKey)
      logger.info({ email, issuer }, 'Calculated issuer.')
      account.issuer = issuer
      await account.save()
    } catch (error) {
      logger.error({ email, error })
    }
  }

  await mongoDB.stop()
}

const configurationToMongoDB = (configuration: Configuration) => ({
  mongodbUrl: configuration.mongodbUrl,
  options: {
    socketTimeoutMS: configuration.mongodbSocketTimeoutMS,
    keepAlive: configuration.mongodbKeepAlive,
    reconnectTries: configuration.mongodbReconnectTries,
    useNewUrlParser: configuration.mongodbUseNewUrlParser,
  },
  loggingConfiguration: {
    loggingLevel: configuration.loggingLevel,
    loggingPretty: configuration.loggingPretty,
  },
})

// tslint:disable:no-console
main().catch(console.error)
