/* tslint:disable:no-relative-imports */
import fetch from 'node-fetch'
import { describe } from 'riteway'

import { Frost } from '../../src/Frost'
import { Path } from '../../src/api/Path'
import { FROST_HOST, FROST_PORT, FROST_URL, delay, runtimeId, createDatabase } from '../helpers/utils'

const options = {
    headers: { 'Content-Type': 'application/json' },
  }

describe('gracefully stopping the application', async assert => {
  const db = await createDatabase(`test-integration-frost-api-poet-${runtimeId()}`)

  const server = await Frost({
    FROST_PORT,
    FROST_HOST,
    FROST_URL,
    MONGODB_DATABASE: db.settings.tempDbName,
    MONGODB_USER: db.settings.tempDbUser,
    MONGODB_PASSWORD: db.settings.tempDbPassword,
    MONGODB_URL: 'mongodb://localhost:27017/frost', // force calc of url in configuration
  })
  await delay(5)

  const actual = await fetch(`${FROST_URL}${Path.HEALTH}`, options)

  assert({
    given: 'a fetch from the health endpoint',
    should: 'return status === 200',
    actual: actual.status,
    expected: 200,
  })

  await server.stop()
  await db.teardown()
})
