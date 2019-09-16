import { describe } from 'riteway'
import SecurePassword = require('secure-password')

import { passwordMatches } from './Password'

const sekretPassword = 'Ae-12345678'
const securePassword = new SecurePassword()

describe('verify', async assert => {
  const hash = (await securePassword.hash(Buffer.from(sekretPassword))).toString()

  {
    const actual = await passwordMatches(sekretPassword, hash)

    assert({
      given: 'a password string and a valid hash of the string',
      should: 'return true',
      actual,
      expected: true,
    })
  }

  {
    const actual = await passwordMatches('FOO', hash)

    assert({
      given: 'an invalid password and a hash',
      should: 'return false',
      actual,
      expected: false,
    })
  }
})
