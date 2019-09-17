import { getVerifiableClaimSigner } from '@po.et/poet-js'
import { MongoClient } from 'mongodb'
import * as Pino from 'pino'

import { RestServer } from './api/RestServer'
import { Router } from './api/Router'
import { Configuration } from './configuration'
import { AccountController } from './controllers/AccountController'
import { ArchiveController } from './controllers/ArchiveController'
import { WorkController } from './controllers/WorkController'
import { AccountDao } from './daos/AccountDao'
import { PoetNode } from './daos/PoetNodeDao'
import { PasswordHelper } from './helpers/Password'
import { initVault } from './initVault'
import { loadConfigurationWithDefaults } from './loadConfiguration'
import { loggingConfigurationToPinoConfiguration } from './utils/Logging/Logging'
import { SendEmail } from './utils/SendEmail'
import { Vault } from './utils/Vault/Vault'

export async function Frost(localVars: any = {}) {
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

  const mongoClient = await MongoClient.connect(configuration.mongodbUrl)
  const dbConnection = await mongoClient.db()
  const accountCollection = dbConnection.collection('accounts')
  const accountDao = AccountDao(accountCollection)

  const sendEmail = SendEmail({
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
  })

  const mainnetNode = PoetNode(configuration.poetUrl)
  const testnetNode = PoetNode(configuration.testPoetUrl)

  const passwordHelper = PasswordHelper()

  const accountController = AccountController({
    dependencies: {
      logger: logger.child({ file: 'AccountController' }),
      accountDao,
      sendEmail,
      passwordHelper,
    },
    configuration: {
      verifiedAccount: configuration.verifiedAccount,
      jwtSecret: configuration.jwt,
      privateKeyEncryptionKey: configuration.privateKeyEncryptionKey,
    },
  })

  const workController = WorkController({
    configuration: {
      privateKeyEncryptionKey: configuration.privateKeyEncryptionKey,
    },
    dependencies: {
      logger: logger.child({ file: 'WorkController' }),
      mainnetNode,
      testnetNode,
      verifiableClaimSigner: getVerifiableClaimSigner(),
    },
  })

  const archiveController = ArchiveController({
    dependencies: {
      logger: logger.child({ file: 'ArchiveController' }),
      mainnetNode,
      testnetNode,
    },
    configuration: {
      ethereumUrl: configuration.ethereumUrl,
      poeContractDecimals: configuration.poeContractDecimals,
      poeContractAddress: configuration.poeContractAddress,
      poeBalanceMinimum: configuration.poeBalanceMinimum,
      maximumFileSizeInBytes: configuration.maximumFileSizeInBytes,
    },
  })

  const router = Router({
    configuration: {
      passwordComplexity: {
        min: configuration.passwordComplexMin,
        max: configuration.passwordComplexMax,
        lowerCase: configuration.passwordComplexLowerCase,
        upperCase: configuration.passwordComplexUpperCase,
        numeric: configuration.passwordComplexNumeric,
        symbol: configuration.passwordComplexSymbol,
      },
      maxApiTokens: configuration.maxApiTokens,
    },
    dependencies: {
      accountController,
      archiveController,
      workController,
    },
  })

  const restServer = await RestServer({
    configuration: {
      host: configuration.frostHost,
      port: configuration.frostPort,
      maxApiRequestLimitForm: configuration.maxApiRequestLimitForm,
      maxApiRequestLimitJson: configuration.maxApiRequestLimitJson,
      loggingConfiguration: {
        loggingLevel: configuration.loggingLevel,
        loggingPretty: configuration.loggingPretty,
      },
    },
    dependencies: {
      router,
    },
  })

  await accountDao.createIndices()

  return {
    stop: async () => {
      await restServer.stop()
      await mongoClient.close()
      return true
    },
  }
}
