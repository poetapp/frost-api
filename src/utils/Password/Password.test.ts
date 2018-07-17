import { describe } from 'riteway'
import { INVALID, hasher, verify } from './Password'

const sekretPassword = 'Ae-12345678'

describe('hasher', async (should: any) => {
  const { assert } = should()

  {
    const actual = await hasher(sekretPassword)

    assert({
      given: 'a password string',
      should: 'return a hash',
      actual: typeof actual,
      expected: 'object',
    })
  }
})

describe('verify', async (should: any) => {
  const { assert } = should()

  const hash = (await hasher(sekretPassword)).toString()

  {
    let actual
    try {
      actual = await verify(sekretPassword, hash)
    } catch (e) {
      actual = e
    }

    assert({
      given: 'a password string and a valid hash of the string',
      should: 'return true',
      actual,
      expected: true,
    })
  }

  {
    let actual
    try {
      actual = await verify('FOO', hash)
    } catch (e) {
      actual = e
    }

    assert({
      given: 'an invalid password and a hash',
      should: 'throw an error',
      actual,
      expected: INVALID,
    })
  }
})
