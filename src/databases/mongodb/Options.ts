export interface Options {
  readonly useMongoClient: boolean
  readonly socketTimeoutMS: number
  readonly keepAlive: number
  readonly reconnectTries: number
  readonly promiseLibrary: object
}
