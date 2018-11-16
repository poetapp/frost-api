import fetch from 'node-fetch'
import { describe } from 'riteway'

import { Path } from '../../src/api/Path'
import { app } from '../../src/app'
import { createUser } from '../helpers/user'
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

describe('Login to an existing account', async assert => {
  const db = await createDatabase(`test-integration-frost-api-poet-${runtimeId()}`)

  const server = await app({
    FROST_PORT,
    FROST_HOST,
    FROST_URL,
    MONGODB_DATABASE: db.settings.tempDbName,
    MONGODB_USER: db.settings.tempDbUser,
    MONGODB_PASSWORD: db.settings.tempDbPassword,
    MONGODB_URL: 'mongodb://localhost:27017/frost', // force calc of url in configuration
  })
  await delay(5)

  await createUser(testUserEmail, testUserPassword)

  {
    const options = {
      method: 'post',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testUserEmail, password: testUserPassword }),
    }

    try {
      const request = await fetch(`${FROST_URL}${Path.LOGIN}`, options)
      const response = await request.json()
      const actual = Object.keys(response).includes('token')

      assert({
        given: `correct user credentials to ${Path.LOGIN}`,
        should: 'return a token',
        actual,
        expected: true,
      })
    } catch (err) {
      assert({
        given: `correct user credentials to ${Path.LOGIN}`,
        should: 'return a token',
        actual: false,
        expected: true,
      })
    }
  }

  {
    const options = {
      method: 'post',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'X' + testUserEmail, password: testUserPassword }),
    }

    const request = await fetch(`${FROST_URL}${Path.LOGIN}`, options)
    const actual = await request.text()

    assert({
      given: `incorrect email to ${Path.LOGIN}`,
      should: 'return an error string',
      actual,
      expected: 'The specified resource does not exist.',
    })
  }

  {
    const options = {
      method: 'post',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testUserEmail, password: 'X' + testUserPassword }),
    }

    const request = await fetch(`${FROST_URL}${Path.LOGIN}`, options)
    const actual = await request.text()

    assert({
      given: `incorrect password to ${Path.LOGIN}`,
      should: 'return an erro string',
      actual,
      expected: 'The specified resource does not exist.',
    })
  }

  await server.stop()
  await db.teardown()
})

describe('Login to an non-existent account', async assert => {
  const db = await createDatabase(`test-integration-frost-api-poet-${runtimeId()}`)

  const server = await app({
    FROST_PORT,
    FROST_HOST,
    FROST_URL,
    MONGODB_DATABASE: db.settings.tempDbName,
    MONGODB_USER: db.settings.tempDbUser,
    MONGODB_PASSWORD: db.settings.tempDbPassword,
    MONGODB_URL: 'mongodb://localhost:27017/frost', // force calc of url in configuration
  })
  await delay(5)

  const options = {
    method: 'post',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'no@exists.com', password: '12345' }),
  }

  const request = await fetch(`${FROST_URL}${Path.LOGIN}`, options)
  const actual = request.text()

  assert({
    given: `non-existent user credentials to ${Path.LOGIN}`,
    should: 'return an error',
    actual,
    expected: {},
  })

  await server.stop()
  await db.teardown()
})
