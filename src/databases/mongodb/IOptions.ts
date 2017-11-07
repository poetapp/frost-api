export default interface IOptions {
  useMongoClient: boolean
  socketTimeoutMS: number
  keepAlive: boolean
  reconnectTries: number
  promiseLibrary: object
}
