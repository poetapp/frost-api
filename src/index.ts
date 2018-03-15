require('dotenv').config({ path: '.env' })
import * as fs from 'fs'
import * as Koa from 'koa'
import * as bodyParser from 'koa-bodyparser'
import * as cors from 'koa2-cors'
import { Path } from './api/Path'
import { routes } from './api/routes'
import { configuration } from './configuration'
import { MongoDB } from './databases/mongodb/mongodb'
import { delay } from './utils/Delay/Delay'
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
    let initialized = false
    let sealed = true
    let standby = true
    let config
    let status

    while (!initialized)
      try {
        logger.log('info', 'waiting vault')
        status = await Vault.status()
        initialized = status.initialized
        if (!status.initialized) {
          config = await Vault.init()
          logger.log('info', 'Vault is initialized')
        }
      } catch (e) {
        logger.log('error', e.message)
        logger.log('info', 'Retry in 5 seconds')
        await delay(5000)
      }

    if (config) {
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

      fs.writeFile('./vault.json', JSON.stringify(config, null, '\t'), err => {
        if (err) return console.log(err)

        console.log('The file was saved!')
      })

      /* tslint:enable:no-console */

      const { keys, root_token } = config
      const vault = Vault.getInstance()
      vault.token = root_token

      while (sealed)
        try {
          status = await Vault.status()
          sealed = status.sealed
          if (status.sealed) {
            logger.log('info', 'vault trying unseal')
            await Vault.unseal(keys[0])
            logger.log('info', 'Vault is unseal')
          }
        } catch (e) {
          logger.log('error', e.message)
          logger.log('info', 'Retry in 5 seconds')
          await delay(5000)
        }

      while (standby) {
        status = await Vault.status()
        standby = status.standby
        if (standby) {
          logger.log('info', 'Vault is in standby')
          logger.log('info', 'Retry in 5 seconds')
          await delay(5000)
        }
      }

      await Vault.mountTransit()
      await Vault.writeTransitKey()
      // Secrets
      const value = {
        transactionalMandrill,
        jwt
      }

      await Vault.writeSecret('frost', value)
      return true
    } else if (status.initialized)
      logger.log(
        'error',
        'Vault was initialized. Check file vault.json in the root project. You have to set the environment variable VAULT_TOKEN '
      )
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
      .use(
        cors({
          origin: (ctx: any, next: any) =>
            ctx.url.includes(Path.WORKS) ? '*' : false
        })
      )
      .use(bodyParser())
      .use(routes.routes())
      .use(routes.allowedMethods())

    app.listen(3000)
  } catch (e) {
    logger.log('error', e.message)
  }
}

main()
