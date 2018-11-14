/* tslint:disable:no-relative-imports */
import fetch from 'node-fetch'
import { describe } from 'riteway'

import { Path } from '../../src/api/Path'
import { app } from '../../src/app'
import { getHeader, delay, runtimeId, createDatabase } from '../helpers/utils'

const PREFIX = `test-integration-frost-api-poet-${runtimeId()}`
process.env.SKIP_VAULT = 'true'

describe('CORS header exists when calling every known route', async assert => {
  const db = await createDatabase(PREFIX)

  const server = await app({
    FROST_PORT: '30080',
    FROST_HOST: 'localhost',
    FROST_URL: 'http://localhost:30080',
    SKIP_VAULT: 'true',
    MONGODB_DATABASE: db.settings.tempDbName,
  })

  await delay(5)

  // TODO: figure out why these routes cause the app to hang on .stop()
  // 5 /acounts/profile
  // 7 /acounts/verify/:token
  for await (const path of Object.values(Path))
    if (path !== '/accounts/profile' && path !== '/accounts/verify/:token') {
    const result = await fetch('http://localhost:30080' + path)

    const actual = getHeader(result, 'Access-Control-Allow-Origin')
    const expected = '*'

    assert({
      given: `a call to ${path}`,
      should: 'Should return Access-Control-Allow-Origin with *',
      actual,
      expected,
    })
  }

  await server.stop()
  await db.teardown()
})
