import * as Koa from 'koa'
import * as bodyParser from 'koa-bodyparser'
import * as helmet from 'koa-helmet'
import * as cors from 'koa2-cors'

import { securityHeaders } from '../securityHeaders'
import { logger } from '../utils/Logger/Logger'
import { SendEmailConfiguration } from '../utils/SendEmail'

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
    passwordChangeLimiter: LimiterConfiguration
  }
  poetUrl: string
  maxApiTokens: number
}

interface APIMethods {
  start(): Promise<APIMethods>
  stop(): Promise<APIMethods>
}

const init = ({
  maxApiRequestLimitForm,
  maxApiRequestLimitJson,
  passwordComplex,
  sendEmail,
  rateLimit,
  limiters,
  poetUrl,
  maxApiTokens,
}: APIConfiguration) => {
  const app = new Koa()
  const route = routes(passwordComplex, sendEmail, rateLimit, limiters, poetUrl, maxApiTokens)

  app
    .use(helmet(securityHeaders))
    .use(
      cors({
        origin: (ctx: any, next: any) => '*',
      })
    )
    .use(
      bodyParser({
        formLimit: maxApiRequestLimitForm,
        jsonLimit: maxApiRequestLimitJson,
      })
    )
    .use(route.routes())
    .use(route.allowedMethods())

  return app
}

const startAPI = async (app: any, configuration: APIConnection) => {
  logger.info('Starting API...')
  const server = await app.listen(configuration.port, configuration.host)
  logger.info('Started API.')
  return server
}

const stopAPI = async (server: any) => {
  logger.info('Stopping API...')
  await server.close()
  logger.info('Stopped API.')
}

export const API = (configuration: APIConfiguration): APIMethods => {
  return {
    async start(): Promise<APIMethods> {
      const app = init(configuration)
      this.server = await startAPI(app, configuration)
      return this
    },
    async stop(): Promise<APIMethods> {
      await stopAPI(this.server)
      return this
    },
  }
}
