import * as Koa from 'koa'
import * as bodyParser from 'koa-bodyparser'
import { routes } from './api/routes'
import { configuration } from './configuration'
import { MongoDB } from './databases/mongodb/mongodb'
import { logger } from './utils/Logger/Logger'
import { Nodemailer } from './utils/Nodemailer/Nodemailer'
import { Vault } from './utils/Vault/Vault'
const Box = require('cli-box')
require('console.table')

const {
  mongodbUrl,
  vaultUrl,
  vaultToken,
  transactionalMandrill,
  jwt
} = configuration

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

const initVault = async () => {
  try {
    const config = await Vault.init()

    // Box with aligned text to top-right
    const box = Box('30x5', {
      text: `
      \u001b[31mIMPORTANT!!!\u001b[0m
      \nCopy this keys in a secure place. \nThese keys are very important and it does not way recovery.`,
      stretch: true,
      autoEOL: true,
      vAlign: 'middle',
      hAlign: 'left'
    })

    /* tslint:disable:no-console */

    console.log(box)
    console.table(config)

    /* tslint:enable:no-console */

    const { keys, root_token } = config
    const vault = Vault.getInstance()
    vault.token = root_token

    await Vault.unseal(keys[0])

    await Vault.mountTransit()
    await Vault.writeTransitKey()

    // Secrets
    const value = {
      transactionalMandrill,
      jwt
    }

    await Vault.writeSecret('frost', value)
    return true
  } catch (e) {
    logger.log('error', e.message)
  }
}

const main = async () => {
  try {
    Vault.config(optionsVault)

    // Init vault and unseal
    // https://www.vaultproject.io/intro/getting-started/deploy.html
    if (!vaultToken) await initVault()
  } catch (e) {
    logger.log('error', e.message)
  }

  // Try to read Vault
  try {
    const secret = await Vault.readSecret('frost')
    const optionsNodemailer = {
      apiKey: secret.data.transactionalMandrill
    }

    Nodemailer.config(optionsNodemailer)
  } catch (e) {
    logger.log('error', e.message)
  }

  // Connect mongodb
  try {
    const mongoDB = new MongoDB(mongodbUri, optionsMongoDB)
    await mongoDB.start()
  } catch (e) {
    logger.log('error', e.message)
  }

  try {
    const app = new Koa()

    app
      .use(bodyParser())
      .use(routes.routes())
      .use(routes.allowedMethods())

    app.listen(3000)
  } catch (e) {
    logger.log('error', e.message)
  }
}

main()
