import * as mongoose from 'mongoose'

import { logger } from '../../utils/Logger/Logger'
import { MongoDBConfiguration } from './mongoDBConfiguration'

interface APIMethods {
  start(): Promise<APIMethods>
  stop(): Promise<APIMethods>
}

const startMongoDB = async ({ mongodbUrl, options }: MongoDBConfiguration) => {
  logger.info('Starting connection with MongoDB...')
  require('mongoose').Promise = Promise
  const connection = await mongoose.connect(
    mongodbUrl,
    options
  )
  logger.info('Started connection with MongoDB...')
  return connection
}

const stopMongoDB = async (database: any) => {
  logger.info('Closing connection with MongoDB...')
  await database.connection.close()
  logger.info('Closed connection with MongoDB.')
}

export const MongoDB = (configuration: MongoDBConfiguration): APIMethods => {
  return {
    async start(): Promise<APIMethods> {
      this.database = await startMongoDB(configuration)
      return this
    },
    async stop(): Promise<APIMethods> {
      await stopMongoDB(this.database)
      return this
    },
  }
}
