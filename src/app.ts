require('dotenv').config({ path: '.env' })
import * as fs from 'fs'

import * as Pino from 'pino'
import { API } from './api/API'
import { Configuration } from './configuration'
import { MongoDB } from './databases/mongodb/mongodb'
import { loadConfigurationWithDefaults } from './loadConfiguration'
import { delay } from './utils/Delay/Delay'
import { createModuleLogger } from './utils/Logger/Logging'
import { Vault } from './utils/Vault/Vault'
const Box = require('cli-box')
require('console.table')

interface InitVault {
  transactionalMandrill: string
  jwt: string
}

const initVault = async ({ transactionalMandrill, jwt }: InitVault, logger: Pino.Logger) => {
  try {
    let initialized = false
    let sealed = true
    let standby = true
    let config
    let status

    while (!initialized)
      try {
        logger.info('info', 'waiting vault')
        status = await Vault.status()
        initialized = status.initialized
        if (!status.initialized) {
          config = await Vault.init()
          logger.info('info', 'Vault is initialized')
        }
      } catch (e) {
        logger.info('error', e.message)
        logger.info('info', 'Retry in 5 seconds')
        await delay(5000)
      }

    if (config) {
      const box = Box('30x5', {
        text: `
        \u001b[31mIMPORTANT!!!\u001b[0m
        \nCopy this keys in a secure place. \nThese keys are very important and it does not way recovery.`,
        stretch: true,
        autoEOL: true,
        vAlign: 'middle',
        hAlign: 'left',
      })

      /* tslint:disable:no-console */

      console.log(box)
      console.table(config)

      fs.writeFile('./vault.json', JSON.stringify(config, null, '\t'), err => {
        if (err) return console.log(err)

        console.log('The file was saved!')
      })

      /* tslint:enable:no-console */

      const { keys, root_token } = config
      const vault = Vault.getInstance()
      vault.token = root_token

      while (sealed)
        try {
          status = await Vault.status()
          sealed = status.sealed
          if (status.sealed) {
            logger.info('info', 'vault trying unseal')
            await Vault.unseal(keys[0])
            logger.info('info', 'Vault is unseal')
          }
        } catch (e) {
          logger.info('error', e.message)
          logger.info('info', 'Retry in 5 seconds')
          await delay(5000)
        }

      while (standby) {
        status = await Vault.status()
        standby = status.standby
        if (standby) {
          logger.info('info', 'Vault is in standby')
          logger.info('info', 'Retry in 5 seconds')
          await delay(5000)
        }
      }

      await Vault.mountTransit()
      await Vault.writeTransitKey()
      // Secrets
      const value = {
        transactionalMandrill,
        jwt,
      }

      await Vault.writeSecret('frost', value)
      return true
    } else if (status.initialized)
      logger.info(
        'error',
        'Vault was initialized. Check file vault.json in the root project. \
         You have to set the environment variable VAULT_TOKEN ',
      )
  } catch (e) {
    logger.info('error', e.message)
  }
}

export async function app(localVars: any = {}) {
  const configuration: Configuration = loadConfigurationWithDefaults(localVars)

  const loggingConfiguration = {
    loggingLevel: configuration.loggingLevel,
    loggingPretty: configuration.loggingPretty,
  }

  const logger = createModuleLogger(loggingConfiguration)(__dirname)

  logger.info('Running Frost API')
  logger.info('')
  logger.info('Loading Configuration...')

  logger.info(configuration)

  const configurationVault = {
    token: configuration.vaultToken,
    endpoint: configuration.vaultUrl,
    apiVersion: configuration.vaultApiVersion,
  }

  const configurationInitVault = {
    transactionalMandrill: configuration.transactionalMandrill,
    jwt: configuration.jwt,
  }

  try {
    Vault.config(configurationVault)

    // Init vault and unseal
    // https://www.vaultproject.io/intro/getting-started/deploy.html
    if (!configurationVault.token) await initVault(configurationInitVault, logger)
    await Vault.mountAuthTune()
  } catch (e) {
    logger.error(e.message)
  }

  const secret = await Vault.readSecret('frost')

  const configurationMongoDB = {
    mongodbUrl: configuration.mongodbUrl,
    options: {
      socketTimeoutMS: configuration.mongodbSocketTimeoutMS,
      keepAlive: configuration.mongodbKeepAlive,
      reconnectTries: configuration.mongodbReconnectTries,
      useNewUrlParser: configuration.mongodbUseNewUrlParser,
    },
  }

  const configurationFrostAPI = {
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
          apiKey: secret.data.transactionalMandrill,
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
      redisPort: configuration.redisPort,
      redisHost: configuration.redisHost,
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
  }

  const mongoDB = await MongoDB(configurationMongoDB).start()
  const frostAPI = await API(configurationFrostAPI).start()

  return {
    stop: async () => {
      await frostAPI.stop()
      await mongoDB.stop()
      return true
    },
  }
}
