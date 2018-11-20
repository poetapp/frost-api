import * as Koa from 'koa'
import * as bodyParser from 'koa-bodyparser'
import * as helmet from 'koa-helmet'
import * as cors from 'koa2-cors'
import * as Pino from 'pino'

import { securityHeaders } from '../securityHeaders'
import { createModuleLogger, LoggingConfiguration } from '../utils/Logging/Logging'
import { SendEmailConfiguration } from '../utils/SendEmail'

import { logger } from '../middlewares/logger'
import { LimiterConfiguration, RateLimitConfiguration } from '../middlewares/rateLimit'
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
  rateLimit: RateLimitConfiguration
  limiters: {
    loginLimiter: LimiterConfiguration
    accountLimiter: LimiterConfiguration
    passwordChangeLimiter: LimiterConfiguration,
  }
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

const init = (redisDB: any) => ({
  maxApiRequestLimitForm,
  maxApiRequestLimitJson,
  passwordComplex,
  sendEmail,
  rateLimit,
  limiters,
  poetUrl,
  testPoetUrl,
  maxApiTokens,
  verifiedAccount,
  pwnedCheckerRoot,
  loggingConfiguration,
}: APIConfiguration) => {
  const app = new Koa()
  const route = routes(redisDB)(
    passwordComplex,
    sendEmail,
    rateLimit,
    limiters,
    poetUrl,
    maxApiTokens,
    testPoetUrl,
    verifiedAccount,
    pwnedCheckerRoot,
  )

  app
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

export const API = (redisDB: any) => (configuration: APIConfiguration): APIMethods => {
  const { loggingConfiguration } = configuration
  const logger = createModuleLogger(loggingConfiguration)(__dirname)

  return {
    async start(): Promise<APIMethods> {
      const app = init(redisDB)(configuration)
      this.server = await startAPI(app, configuration, logger)
      return this
    },
    async stop(): Promise<APIMethods> {
      await stopAPI(this.server, logger)
      return this
    },
  }
}
