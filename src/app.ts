import * as Pino from 'pino'

const Redis = require('ioredis')

import { API } from './api/API'
import { Configuration } from './configuration'
import { MongoDB } from './databases/mongodb/mongodb'
import { initVault } from './initVault'
import { loadConfigurationWithDefaults } from './loadConfiguration'
import { Account } from './modules/Accounts/Accounts.model'
import { loggingConfigurationToPinoConfiguration } from './utils/Logging/Logging'
import { Vault } from './utils/Vault/Vault'

import './extensions/Error'

require('dotenv').config({ path: '.env' })
require('console.table')

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

  const configurationMongoDB = configurationToMongoDB(configuration)
  const configurationFrostAPI = configurationToFrostAPI(configuration)

  const redisDB = await new Redis(configuration.redisPort, configuration.redisHost)
  const mongoDB = await MongoDB(configurationMongoDB).start()
  const frostAPI = await API(redisDB)(configurationFrostAPI).start()

  // Mongoose sometimes fails to create indices
  await Account.collection.createIndex({ email: 1 }, { unique: true })

  return {
    stop: async () => {
      await frostAPI.stop()
      await mongoDB.stop()
      await redisDB.disconnect()
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
  rateLimit: {
    rateLimitDisabled: configuration.rateLimitDisabled,
  },
  limiters: {
    loginLimiter: {
      max: configuration.loginRateLimitMax,
      duration: configuration.loginRateLimitDuration,
    },
    accountLimiter: {
      max: configuration.accountRateLimitMax,
      duration: configuration.accountRateLimitDuration,
    },
    passwordChangeLimiter: {
      max: configuration.passwordChangeRateLimitMax,
      duration: configuration.passwordChangeRateLimitDuration,
    },
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
