import fetch from 'node-fetch'
import { describe } from 'riteway'

import { Path } from '../../src/api/Path'
import { app } from '../../src/app'
import {
  testUserEmail,
  testUserPassword,
  FROST_HOST,
  FROST_PORT,
  FROST_URL,
  delay,
  runtimeId,
  createDatabase,
} from '../helpers/utils'

const createUserOptions = {
  method: 'post',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: testUserEmail, password: testUserPassword }),
}

describe('Rate limiting enabled', async assert => {
  const expected = '5'

  const db = await createDatabase(`test-integration-frost-api-poet-${runtimeId()}`)

  const server = await app({
    FROST_PORT,
    FROST_HOST,
    MONGODB_DATABASE: db.settings.tempDbName,
    MONGODB_USER: db.settings.tempDbUser,
    MONGODB_PASSWORD: db.settings.tempDbPassword,
    MONGODB_URL: 'mongodb://localhost:27017/frost', // force calc of url in configuration
    RATE_LIMIT_DISABLED: false,
    ACCOUNT_RATE_LIMIT_MAX: expected,
  })
  await delay(5000)

  const request = await fetch(`${FROST_URL}${Path.ACCOUNTS}`, createUserOptions)

  assert({
    given: `a configuration value for accountRateLimitMax of ${expected}`,
    should: 'return the same value in the "X-Rate-Limit-Limit" header',
    actual: request.headers.get('X-Rate-Limit-Limit'),
    expected,
  })

  assert({
    given: `a configuration value for accountRateLimitMax of ${expected}`,
    should: 'return a smaller value in the "X-Rate-Limit-Remaining" header',
    actual: request.headers.get('X-Rate-Limit-Remaining') < expected,
    expected: true,
  })

  {
    const headerTime = new Date(parseInt(request.headers.get('X-Rate-Limit-Reset'), 10) * 1000).getTime()
    const actual = headerTime > Date.now()

    assert({
      given: `a configuration value for accountRateLimitMax of ${expected}`,
      should: 'return a reset date in the future in "X-Rate-Limit-Reset" header',
      actual,
      expected: true,
    })
  }

  await server.stop()
  await db.teardown()
})

describe('Rate limiting disabled', async assert => {
  const db = await createDatabase(`test-integration-frost-api-poet-${runtimeId()}`)

  const server = await app({
    FROST_PORT,
    FROST_HOST,
    MONGODB_DATABASE: db.settings.tempDbName,
    MONGODB_USER: db.settings.tempDbUser,
    MONGODB_PASSWORD: db.settings.tempDbPassword,
    MONGODB_URL: 'mongodb://localhost:27017/frost', // force calc of url in configuration
    RATE_LIMIT_DISABLED: true,
  })
  await delay(5000)

  const request = await fetch(`${FROST_URL}${Path.ACCOUNTS}`, createUserOptions)

  assert({
    given: `a request to "${FROST_URL}${Path.ACCOUNTS}" with rate limiting disabled`,
    should: 'not have an "X-Rate-Limit-Limit" header in the response',
    actual: request.headers.get('X-Rate-Limit-Limit'),
    expected: null,
  })

  assert({
    given: `a request to "${FROST_URL}${Path.ACCOUNTS}" with rate limiting disabled`,
    should: 'not have an "X-Rate-Limit-Remaining" header in the response',
    actual: request.headers.get('X-Rate-Limit-Remaining'),
    expected: null,
  })

  assert({
    given: `a request to "${FROST_URL}${Path.ACCOUNTS}" with rate limiting disabled`,
    should: 'not have an "X-Rate-Limit-Reset" header in the response',
    actual: request.headers.get('X-Rate-Limit-Reset'),
    expected: null,
  })

  await server.stop()
  await db.teardown()
})
