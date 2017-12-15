import * as Koa from 'koa'
import * as bodyParser from 'koa-bodyparser'
import { routes } from './api/routes'
import { configuration } from './configuration'
import { MongoDB } from './databases/mongodb/mongodb'
import { logger } from './utils/Logger/Logger'
import { Nodemailer } from './utils/Nodemailer/Nodemailer'
import { Vault } from './utils/Vault/Vault'

const { mongodbUrl, vaultUrl, vaultToken } = configuration

const mongodbUri = mongodbUrl

const optionsMongoDB = {
  useMongoClient: true,
  socketTimeoutMS: 0,
  keepAlive: 0,
  reconnectTries: 30,
  promiseLibrary: Promise
}

const optionsVault = {
  token: vaultToken,
  endpoint: vaultUrl,
  apiVersion: 'v1'
}

const main = async () => {
  try {
    try {
      Vault.config(optionsVault)
      const secret = await Vault.readSecret('frost')
      const optionsNodemailer = {
        apiKey: secret.data['transactional-mandrill']
      }

      Nodemailer.config(optionsNodemailer)
    } catch (e) {
      logger.log('Error Vault: ', e)
    }

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
