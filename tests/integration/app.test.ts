/* tslint:disable:no-relative-imports */
// IMPORTANT: If this fails due to the app not being able to flush it's
// event queue, this test will hang forever.
// Can we force the app to flush it's queue without killing the entire
// process (which would kill the test runner)?

import { describe } from 'riteway'

import { app } from '../../src/app'
import { delay, runtimeId, createDatabase } from '../helpers/utils'

const PREFIX = `test-interation-frost-api-poet-${runtimeId()}`

describe('gracefully stopping the application', async assert => {
  const db = await createDatabase(PREFIX)

  const server = await app({
    FROST_PORT: '30080',
    FROST_HOST: 'localhost',
    FROST_URL: 'http://localhost:30080',
    SKIP_VAULT: 'true',
    MONGODB_DATABASE: db.settings.tempDbName,
  })

  // alow time for everything to start.
  await delay(5)

  const actual = await server.stop()

  assert({
    given: 'a running app',
    should: `exit when stop() is called`,
    actual,
    expected: true,
  })

  await db.teardown()
})