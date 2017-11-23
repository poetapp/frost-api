import * as Koa from 'koa'
import * as bodyParser from 'koa-bodyparser'
import { routes } from './api/routes'
import { MongoDB } from './databases/mongodb/mongodb'
import { logger } from './modules/Logger/Logger'
import { Nodemailer } from './modules/Nodemailer/Nodemailer'
import { Vault } from './modules/Vault/Vault'

const mongodbUri = 'mongodb://localhost:27017/test'

const optionsMongoDB = {
  useMongoClient: true,
  socketTimeoutMS: 0,
  keepAlive: true,
  reconnectTries: 30,
  promiseLibrary: Promise
}

const optionsVault = {
  token: 'poet',
  endpoint: 'http://0.0.0.0:8200',
  apiVersion: 'v1'
}

const main = async () => {
  try {
    Vault.config(optionsVault)
    const secret = await Vault.readSecret('frost')

    const optionsNodemailer = {
      apiKey: secret.data['transactional-mandrill']
    }

    Nodemailer.config(optionsNodemailer)

    const mongoDB = new MongoDB(mongodbUri, optionsMongoDB)
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
