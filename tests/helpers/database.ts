/* tslint:disable:no-console */
/* tslint:disable:no-relative-imports */
import { MongoClient } from 'mongodb'
import { pipeP } from 'ramda'

import { loadConfigurationWithDefaults } from '../../src/loadConfiguration'
import { delay, runtimeId } from './utils'

export const dbHelper = () => {
  const id: string = runtimeId()
  let setupCalled = false
  let tempDbName: string

  const dbExecute = async (...fns: any) => {
    const localVars = {
      MONGODB_USER: 'root',
      MONGODB_PASSWORD: 'rootPass',
      MONGODB_DATABASE: tempDbName,
    }

    const config = loadConfigurationWithDefaults(localVars)
    // This needs to be hardcoded until all integration tests are converted to riteway.
    const mongodbUrl = `mongodb://root:rootPass@${config.mongodbHost}/${tempDbName}`

    log(`Connecting to temporary DB (${mongodbUrl})...`)
    const mongoClient = await MongoClient.connect(
      mongodbUrl,
      {
        authSource: 'admin',
        useNewUrlParser: true,
      },
    )

    try {
      const db = await mongoClient.db()
      await pipeP(...fns)(db)
    } catch (err) {
      console.log(err)
    }

    await delay(1300)
    await mongoClient.close()
  }

  return {
    setup: async (
      dbNamePrefix: string = null,
      dbUser: string = null,
      dbPassword: string = null,
    ) => {
      tempDbName = dbNamePrefix || id
      const tempDbUser = dbUser || `test-${id}`
      const tempDbPassword = dbPassword || 'sekretP455wurd'

      log(`Creating temporary DB (${tempDbName})...`)
      await dbExecute(
        async (db: any) => db.addUser(tempDbUser, tempDbPassword, { roles: ['readWrite'] }),
      )

      setupCalled = true

      return {
        tempDbName,
        tempDbUser,
        tempDbPassword,
      }
    },

    teardown: async () => {
      if (!setupCalled) throw new Error('setup() must be called before teardown().')
      log(`Deleting temporary DB (${tempDbName})...`)
      await dbExecute(async (db: any) => db.dropDatabase())
    },
  }
}

const log = (what: string) => {
  if (process.env.TEST_CONSOLE_LOG === 'true') console.log(what)
}
