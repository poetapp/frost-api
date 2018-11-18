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

describe('Requesting create of an already existing account', async assert => {
  const db = await createDatabase(`test-integration-frost-api-poet-${runtimeId()}`)

  const server = await app({
    FROST_PORT,
    FROST_HOST,
    MONGODB_DATABASE: db.settings.tempDbName,
    MONGODB_USER: db.settings.tempDbUser,
    MONGODB_PASSWORD: db.settings.tempDbPassword,
    MONGODB_URL: 'mongodb://localhost:27017/frost', // force calc of url in configuration
  })
  await delay(5000)

  const firstRequest = await fetch(`${FROST_URL}${Path.ACCOUNTS}`, createUserOptions)

  assert({
    given: `a MESS at ${FROST_URL}${Path.ACCOUNTS}`,
    should: 'return ok = true',
    actual: firstRequest.ok,
    expected: true,
  })

  const request = await fetch(`${FROST_URL}${Path.ACCOUNTS}`, createUserOptions)

  assert({
    given: `existing user account info and a "${createUserOptions.method}" request to ${Path.ACCOUNTS}`,
    should: 'return ok = false',
    actual: request.ok,
    expected: false,
  })

  await server.stop()
  await db.teardown()
})

describe('Successfully create a user account', async assert => {
  const db = await createDatabase(`test-integration-frost-api-poet-${runtimeId()}`)

  const server = await app({
    FROST_PORT,
    FROST_HOST,
    MONGODB_DATABASE: db.settings.tempDbName,
    MONGODB_USER: db.settings.tempDbUser,
    MONGODB_PASSWORD: db.settings.tempDbPassword,
    MONGODB_URL: 'mongodb://localhost:27017/frost', // force calc of url in configuration
  })
  await delay(5000)

  const request = await fetch(`${FROST_URL}${Path.ACCOUNTS}`, createUserOptions)
  const response = await request.json()

  assert({
    given: `a "${createUserOptions.method}" request to ${Path.ACCOUNTS}`,
    should: 'return ok = true',
    actual: request.ok,
    expected: true,
  })

  assert({
    given: `valid input and a "${createUserOptions.method}" request to ${Path.ACCOUNTS}`,
    should: 'return a token property in the response',
    actual: Object.keys(response).includes('token'),
    expected: true,
  })

  await server.stop()
  await db.teardown()
})
