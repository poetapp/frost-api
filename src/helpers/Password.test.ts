import { describe } from 'riteway'
import SecurePassword = require('secure-password')

import { PasswordHelper } from './Password'

const sekretPassword = 'Ae-12345678'
const securePassword = new SecurePassword()

describe('passwordMatches', async assert => {
  const passwordHelper = PasswordHelper()
  const hash = (await securePassword.hash(Buffer.from(sekretPassword))).toString()

  {
    const actual = await passwordHelper.passwordMatches(sekretPassword, hash)

    assert({
      given: 'a password string and a valid hash of the string',
      should: 'return true',
      actual,
      expected: true,
    })
  }

  {
    const actual = await passwordHelper.passwordMatches('FOO', hash)

    assert({
      given: 'an invalid password and a hash',
      should: 'return false',
      actual,
      expected: false,
    })
  }
})
