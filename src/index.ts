import * as Koa from 'koa'
import * as bodyParser from 'koa-bodyparser'
import { connect, connection, model, Schema } from 'mongoose'
import { routes } from './api/routes'
import { MongoDB } from './databases/mongodb/mongodb'
import { logger } from './modules/Logger/Logger'
import { Vault } from './modules/Vault/Vault'

const mongodbUri = 'mongodb://localhost:27017/test'

const options = {
  useMongoClient: true,
  socketTimeoutMS: 0,
  keepAlive: true,
  reconnectTries: 30,
  promiseLibrary: Promise
}

const main = async () => {
  try {
    const vault = Vault.config({
      token: 'goldfish',
      endpoint: 'http://0.0.0.0:8200',
      apiVersion: 'v1'
    })
    const mongoDB = new MongoDB(mongodbUri, options)
    await mongoDB.start()
    const app = new Koa()

    app
      .use(bodyParser())
      .use(routes.routes())
      .use(routes.allowedMethods())

    app.listen(3000)
  } catch (e) {
    logger.log('error', e)
  }
}

main()
