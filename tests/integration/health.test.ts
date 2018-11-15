/* tslint:disable:no-relative-imports */
import fetch from 'node-fetch'
import { describe } from 'riteway'

import { Path } from '../../src/api/Path'
import { app } from '../../src/app'
import { FROST_HOST, FROST_PORT, FROST_URL, delay, runtimeId, createDatabase } from '../helpers/utils'

const PREFIX = `test-interation-frost-api-poet-${runtimeId()}`
const options = {
    headers: { 'Content-Type': 'application/json' },
  }

describe('gracefully stopping the application', async assert => {
  const db = await createDatabase(PREFIX)

  const server = await app({
    FROST_PORT,
    FROST_HOST,
    FROST_URL,
    SKIP_VAULT: true,
    MONGODB_DATABASE: db.settings.tempDbName,
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
