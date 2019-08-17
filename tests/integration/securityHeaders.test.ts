import fetch from 'node-fetch'
import { describe } from 'riteway'
import { Frost } from '../../src/Frost'
import { delay, runtimeId, createDatabase } from '../helpers/utils'

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
  await delay(5)

  const result = await fetch('http://localhost:30080')

  features.forEach(async feature => {
    assert({
      given: 'a running Frost',
      should: `Should be ${feature.expected} for the header ${feature.value}`,
      actual: result.headers.get(feature.value),
      expected: feature.expected,
    })
  })

  await server.stop()
  await db.teardown()
})
