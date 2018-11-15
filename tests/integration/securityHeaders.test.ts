import fetch from 'node-fetch'
import { describe } from 'riteway'
import { app } from '../../src/app'
import { delay, runtimeId, createDatabase } from '../helpers/utils'

const PREFIX = `test-interation-frost-api-poet-${runtimeId()}`
const features = [
  {
    value: 'content-security-policy',
    expected: `script-src 'self'`,
  },
  {
    value: 'x-frame-options',
    expected: 'DENY',
  },
  {
    value: 'x-xss-protection',
    expected: '1; mode=block',
  },
  {
    value: 'x-content-type-options',
    expected: 'nosniff',
  },
  {
    value: 'referrer-policy',
    expected: 'same-origin',
  },
]

describe('Security headers', async assert => {
  const db = await createDatabase(PREFIX)

  const server = await app({
    FROST_PORT: '30080',
    FROST_HOST: 'localhost',
    FROST_URL: 'http://localhost:30080',
    SKIP_VAULT: 'true',
    MONGODB_DATABASE: db.settings.tempDbName,
  })
  await delay(5)

  const result = await fetch('http://localhost:30080')

  features.forEach(async feature => {
    assert({
      given: 'a running app',
      should: `Should be ${feature.expected} for the header ${feature.value}`,
      actual: result.headers.get(feature.value),
      expected: feature.expected,
    })
  })

  await server.stop()
  await db.teardown()
})
