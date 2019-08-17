import * as Koa from 'koa'
import * as bodyParser from 'koa-bodyparser'
import * as helmet from 'koa-helmet'
import * as KoaRouter from 'koa-router'
import * as cors from 'koa2-cors'

import { securityHeaders } from '../securityHeaders'
import { createModuleLogger, LoggingConfiguration } from '../utils/Logging/Logging'

import { errorHandling } from '../middlewares/errorHandling'
import { logger } from '../middlewares/logger'

interface Configuration {
  readonly host: string
  readonly port: number
  readonly maxApiRequestLimitForm: string
  readonly maxApiRequestLimitJson: string
  readonly loggingConfiguration: LoggingConfiguration
}

interface Dependencies {
  readonly router: KoaRouter
}

interface Arguments {
  readonly configuration: Configuration
  readonly dependencies: Dependencies
}

interface APIMethods {
  readonly stop: () => Promise<void>
}

export const RestServer = async ({
  configuration: {
    port,
    host,
    maxApiRequestLimitForm,
    maxApiRequestLimitJson,
    loggingConfiguration,
  },
  dependencies: {
    router,
  },
}: Arguments): Promise<APIMethods> => {
  const logger = createModuleLogger(loggingConfiguration)(__dirname)

  const koa = ConfiguredKoa({
    maxApiRequestLimitForm,
    maxApiRequestLimitJson,
    loggingConfiguration,
  })

  koa
    .use(router.routes())
    .use(router.allowedMethods())

  logger.info('Starting HTTP Server...')
  const server = await koa.listen(port, host)
  logger.info('Started HTTP Server.')

  const stop = async () => {
    logger.info('Stopping HTTP Server...')
    await server.close()
    logger.info('Stopped HTTP Server.')
  }

  return {
    stop,
  }
}

const ConfiguredKoa = ({
  maxApiRequestLimitForm,
  maxApiRequestLimitJson,
  loggingConfiguration,
}: Partial<Configuration>) =>
  new Koa()
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
