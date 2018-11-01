import { LoggingConfiguration } from '../../utils/Logging/Logging'

interface Options {
  readonly socketTimeoutMS: number
  readonly keepAlive: number
  readonly reconnectTries: number
  readonly useNewUrlParser: boolean
}

export interface MongoDBConfiguration {
  readonly mongodbUrl: string
  readonly options: Options
  readonly loggingConfiguration: LoggingConfiguration
}
