import * as Koa from 'koa'
import * as bodyParser from 'koa-bodyparser'
import * as helmet from 'koa-helmet'
import * as cors from 'koa2-cors'
import * as Pino from 'pino'

import { securityHeaders } from '../securityHeaders'
import { createModuleLogger, LoggingConfiguration } from '../utils/Logging/Logging'
import { SendEmailConfiguration } from '../utils/SendEmail'

import { AccountController } from '../controllers/AccountController'
import { errorHandling } from '../middlewares/errorHandling'
import { logger } from '../middlewares/logger'

import { PasswordComplexConfiguration } from './PasswordComplexConfiguration'
import { routes } from './routes'

interface APIConnection {
  host: string
  port: number
}

interface APIConfiguration extends APIConnection {
  maxApiRequestLimitForm: string
  maxApiRequestLimitJson: string
  host: string
  port: number
  passwordComplex: PasswordComplexConfiguration
  sendEmail: SendEmailConfiguration
  poetUrl: string
  testPoetUrl: string
  maxApiTokens: number
  verifiedAccount: boolean
  pwnedCheckerRoot: string
  loggingConfiguration: LoggingConfiguration
}

interface APIMethods {
  start(): Promise<APIMethods>
  stop(): Promise<APIMethods>
}

const init = (accountController: AccountController) => ({
  maxApiRequestLimitForm,
  maxApiRequestLimitJson,
  passwordComplex,
  sendEmail,
  poetUrl,
  testPoetUrl,
  maxApiTokens,
  verifiedAccount,
  pwnedCheckerRoot,
  loggingConfiguration,
}: APIConfiguration) => {
  const app = new Koa()
  const route = routes(accountController)(
    passwordComplex,
    sendEmail,
    poetUrl,
    maxApiTokens,
    testPoetUrl,
    verifiedAccount,
    pwnedCheckerRoot,
  )

  app
    .use(errorHandling())
    .use(logger(createModuleLogger(loggingConfiguration)))
    .use(helmet(securityHeaders))
    .use(
      cors({
        origin: (ctx: any, next: any) => '*',
      }),
    )
    .use(
      bodyParser({
        formLimit: maxApiRequestLimitForm,
        jsonLimit: maxApiRequestLimitJson,
      }),
    )
    .use(route.routes())
    .use(route.allowedMethods())

  return app
}

const startAPI = async (app: any, configuration: APIConnection, logger: Pino.Logger) => {
  logger.info('Starting API...')
  const server = await app.listen(configuration.port, configuration.host)
  logger.info('Started API.')
  return server
}

const stopAPI = async (server: any, logger: Pino.Logger) => {
  logger.info('Stopping API...')
  await server.close()
  logger.info('Stopped API.')
}

export const API = (accountController: AccountController) => (configuration: APIConfiguration): APIMethods => {
  const { loggingConfiguration } = configuration
  const logger = createModuleLogger(loggingConfiguration)(__dirname)

  return {
    async start(): Promise<APIMethods> {
      const app = init(accountController)(configuration)
      this.server = await startAPI(app, configuration, logger)
      return this
    },
    async stop(): Promise<APIMethods> {
      await stopAPI(this.server, logger)
      return this
    },
  }
}
