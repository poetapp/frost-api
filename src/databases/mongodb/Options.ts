export interface Options {
  readonly useMongoClient: boolean
  readonly socketTimeoutMS: number
  readonly keepAlive: boolean
  readonly reconnectTries: number
  readonly promiseLibrary: object
}
