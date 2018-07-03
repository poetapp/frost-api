import { describe } from 'riteway'
const nock = require('nock')
import { isPwned, result } from './isPwned'

const PWNEDCHECKER_ROOT = 'http://ispwned-checker'

describe('result', async (should: any) => {
  const { assert } = should()

  {
    assert({
      given: 'a status code of 200',
      should: 'return true',
      actual: await result({ status: 200 }),
      expected: true,
    })
  }

  {
    assert({
      given: 'a status code other than 200',
      should: 'return false',
      actual: await result({ status: 404 }),
      expected: false,
    })
  }
})

describe('isPwned', async (should: any) => {
  const { assert } = should()

  {
    nock(PWNEDCHECKER_ROOT)
      .get(/.*/)
      .replyWithError('something awful happened')

    assert({
      given: 'any error calling the pwned checker service',
      should: 'return false',
      actual: await isPwned('password123', PWNEDCHECKER_ROOT),
      expected: false,
    })
  }

  {
    nock(PWNEDCHECKER_ROOT)
      .get(/.*/)
      .reply(404)

    process.env.PWNEDCHECKER_ROOT = PWNEDCHECKER_ROOT

    assert({
      given: 'a known secure password',
      should: 'return false',
      actual: await isPwned('really secure', PWNEDCHECKER_ROOT),
      expected: false,
    })
  }

  {
    nock(PWNEDCHECKER_ROOT)
      .get(/.*/)
      .reply(200)

    assert({
      given: 'a known pwned password',
      should: 'return true',
      actual: await isPwned('password123', PWNEDCHECKER_ROOT),
      expected: true,
    })
  }
})
