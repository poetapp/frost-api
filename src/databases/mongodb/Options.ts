export interface Options {
  readonly socketTimeoutMS: number
  readonly keepAlive: number
  readonly reconnectTries: number
  readonly promiseLibrary: object
}
