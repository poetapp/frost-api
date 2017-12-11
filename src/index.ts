import * as Koa from 'koa'
import * as bodyParser from 'koa-bodyparser'
import { routes } from './api/routes'
import { MongoDB } from './databases/mongodb/mongodb'
import { logger } from './utils/Logger/Logger'
import { Nodemailer } from './utils/Nodemailer/Nodemailer'
import { Vault } from './utils/Vault/Vault'

const defaultConst = {
  mongodbUrl: 'mongodb://localhost:27017/frost',
  vaultUrl: 'http://0.0.0.0:8200',
  vaultToken: 'frost'
}

const { MONGODB_URL, VAULT_URL, VAULT_TOKEN } = process.env

const mongodbUri = MONGODB_URL || defaultConst.mongodbUrl

const optionsMongoDB = {
  useMongoClient: true,
  socketTimeoutMS: 0,
  keepAlive: 0,
  reconnectTries: 30,
  promiseLibrary: Promise
}

const optionsVault = {
  token: VAULT_TOKEN || defaultConst.vaultToken,
  endpoint: VAULT_URL || defaultConst.vaultUrl,
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
