import { MongoClient } from 'mongodb'
import * as Pino from 'pino'

import { API } from './api/API'
import { Configuration } from './configuration'
import { AccountController } from './controllers/AccountController'
import { ArchiveController } from './controllers/ArchiveController'
import { AccountDao } from './daos/AccountDao'
import { PoetNode } from './daos/PoetNodeDao'
import { initVault } from './initVault'
import { loadConfigurationWithDefaults } from './loadConfiguration'
import { loggingConfigurationToPinoConfiguration } from './utils/Logging/Logging'
import { SendEmail } from './utils/SendEmail'
import { Vault } from './utils/Vault/Vault'

import './extensions/Error'

require('dotenv').config({ path: '.env' })

export async function app(localVars: any = {}) {
  const configuration: Configuration = loadConfigurationWithDefaults(localVars)
  const logger = Pino(loggingConfigurationToPinoConfiguration(configuration))

  logger.info('Running Frost API')
  logger.info({ configuration })

  const configurationVault = {
    token: configuration.vaultToken,
    endpoint: configuration.vaultUrl,
    apiVersion: configuration.vaultApiVersion,
  }

  if (!configuration.skipVault)
    try {
      Vault.config(configurationVault)
      if (!configurationVault.token) await initVault()
      await Vault.mountAuthTune()
    } catch (e) {
      logger.error(e, 'Error with Vault')
    }

  const configurationFrostAPI = configurationToFrostAPI(configuration)

  const mongoClient = await MongoClient.connect(configuration.mongodbUrl)
  const dbConnection = await mongoClient.db()
  const accountCollection = dbConnection.collection('accounts')
  const accountDao = AccountDao(accountCollection)

  const sendEmail = SendEmail(configurationFrostAPI.sendEmail)

  const accountController = AccountController({
    dependencies: {
      logger: logger.child({ file: 'AccountController' }),
      accountDao,
      sendEmail,
    },
    configuration: {
      verifiedAccount: configuration.verifiedAccount,
      pwnedCheckerRoot: configuration.pwnedCheckerRoot,
      jwtSecret: configuration.jwt,
    },
  })

  const archiveController = ArchiveController({
    dependencies: {
      logger: logger.child({ file: 'ArchiveController' }),
      mainnetNode: PoetNode(configuration.poetUrl),
      testnetNode: PoetNode(configuration.testPoetUrl),
    },
    configuration: {
      poeContractAddress: configuration.poeContractAddress,
      poeBalanceMinimum: configuration.poeBalanceMinimum,
      maximumFileSizeInBytes: configuration.maximumFileSizeInBytes,
    },
  })

  const frostAPI = await API(accountController, archiveController)(configurationFrostAPI).start()

  await accountDao.createIndices()

  return {
    stop: async () => {
      await frostAPI.stop()
      await mongoClient.close()
      return true
    },
  }
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

const configurationToFrostAPI = (configuration: Configuration) => ({
  host: configuration.frostHost,
  port: configuration.frostPort,
  maxApiRequestLimitForm: configuration.maxApiRequestLimitForm,
  maxApiRequestLimitJson: configuration.maxApiRequestLimitJson,
  passwordComplex: {
    min: configuration.passwordComplexMin,
    max: configuration.passwordComplexMax,
    lowerCase: configuration.passwordComplexLowerCase,
    upperCase: configuration.passwordComplexUpperCase,
    numeric: configuration.passwordComplexNumeric,
    symbol: configuration.passwordComplexSymbol,
  },
  sendEmail: {
    nodemailer: {
      mandrill: {
        apiKey: configuration.transactionalMandrill,
      },
      maildev: {
        host: configuration.maildevPortTcpAddr,
        port: configuration.maildevPortTcpPort,
        ignoreTLS: configuration.maildevIgnoreTLS,
      },
      sendEmailDisabled: configuration.sendEmailDisabled,
      emailTransportMailDev: configuration.emailTransportMailDev,
    },
    emailFrom: configuration.emailFrom,
    emailReply: configuration.emailReply,
    frostChangePassword: configuration.frostChangePassword,
    frostVerifiedAccount: configuration.frostVerifiedAccount,
  },
  poetUrl: configuration.poetUrl,
  testPoetUrl: configuration.testPoetUrl,
  maxApiTokens: configuration.maxApiTokens,
  verifiedAccount: configuration.verifiedAccount,
  pwnedCheckerRoot: configuration.pwnedCheckerRoot,
  loggingConfiguration: {
    loggingLevel: configuration.loggingLevel,
    loggingPretty: configuration.loggingPretty,
  },
})
