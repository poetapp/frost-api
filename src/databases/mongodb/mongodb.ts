import * as mongoose from 'mongoose'
import * as Pino from 'pino'

import { createModuleLogger } from '../../utils/Logger/Logging'
import { MongoDBConfiguration } from './mongoDBConfiguration'

interface APIMethods {
  start(): Promise<APIMethods>
  stop(): Promise<APIMethods>
}

const startMongoDB = async ({ mongodbUrl, options }: MongoDBConfiguration, logger: Pino.Logger) => {
  logger.info('Starting connection with MongoDB...')
  require('mongoose').Promise = Promise
  const connection = await mongoose.connect(
    mongodbUrl,
    options,
  )
  logger.info('Started connection with MongoDB.')
  return connection
}

const stopMongoDB = async (database: any, logger: Pino.Logger) => {
  logger.info('Closing connection with MongoDB...')
  await database.connection.close()
  logger.info('Closed connection with MongoDB.')
}

export const MongoDB = (configuration: MongoDBConfiguration): APIMethods => {
  const { loggingConfiguration } = configuration
  const logger = createModuleLogger(loggingConfiguration)(__dirname)

  return {
    async start(): Promise<APIMethods> {
      this.database = await startMongoDB(configuration, logger)
      return this
    },
    async stop(): Promise<APIMethods> {
      await stopMongoDB(this.database, logger)
      return this
    },
  }
}
