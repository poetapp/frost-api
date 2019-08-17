/* tslint:disable:no-relative-imports */
// IMPORTANT: If this fails due to the app not being able to flush it's
// event queue, this test will hang forever.
// Can we force the app to flush it's queue without killing the entire
// process (which would kill the test runner)?

import { describe } from 'riteway'

import { Frost } from '../../src/Frost'
import { delay, runtimeId, createDatabase } from '../helpers/utils'

describe('gracefully stopping the application', async assert => {
  const db = await createDatabase(`test-integration-frost-api-poet-${runtimeId()}`)

  const server = await Frost({
    FROST_PORT: '30080',
    FROST_HOST: 'localhost',
    FROST_URL: 'http://localhost:30080',
    MONGODB_DATABASE: db.settings.tempDbName,
    MONGODB_USER: db.settings.tempDbUser,
    MONGODB_PASSWORD: db.settings.tempDbPassword,
    MONGODB_URL: 'mongodb://localhost:27017/frost', // force calc of url in configuration
  })

  // alow time for everything to start.
  await delay(5)

  const actual = await server.stop()

  assert({
    given: 'a running Frost',
    should: `exit when stop() is called`,
    actual,
    expected: true,
  })

  await db.teardown()
})
