/* tslint:disable:no-relative-imports */
import fetch from 'node-fetch'
import { describe } from 'riteway'

import { Path } from '../../src/api/Path'
import { app } from '../../src/app'
import { getHeader, delay, runtimeId, createDatabase } from '../helpers/utils'

describe('CORS header exists when calling every known route', async assert => {
  const db = await createDatabase(`test-integration-frost-api-poet-${runtimeId()}`)

  const server = await app({
    FROST_PORT: '30080',
    FROST_HOST: 'localhost',
    FROST_URL: 'http://localhost:30080',
    MONGODB_DATABASE: db.settings.tempDbName,
    MONGODB_USER: db.settings.tempDbUser,
    MONGODB_PASSWORD: db.settings.tempDbPassword,
    MONGODB_URL: 'mongodb://localhost:27017/frost', // force calc of url in configuration
  })

  await delay(5)

  // TODO: figure out why these routes cause the app to hang on .stop()
  for await (const path of Object.values(Path))
    if (
      path !== '/works/:workId' &&
      path !== '/works' &&
      path !== '/tokens' &&
      path !== '/accounts/:issuer'
      && path !== '/accounts/verify/:token'
    ) {
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
