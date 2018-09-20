import { Frost, getOptions } from '@po.et/frost-client'
import { expect } from 'chai'
import { deleteUser } from 'test/Integration/UserDao'
import { configuration } from 'test/Integration/configuration'
import { getHeader, Method } from 'test/Integration/utils'
const { frostUrl, frostAccount } = configuration
const { email, password } = frostAccount

describe('Tokens CORS', function() {
  const frost: Frost = new Frost({
    host: frostUrl,
    email,
    password,
  })

  beforeEach(async function() {
    await deleteUser(email)
  })

  describe('When create an API token', function() {
    it('Should return Access-Control-Allow-Origin with *', async function() {
      const { token } = await frost.create()
      const options = getOptions(Method.POST, { token })
      const result = await fetch(`${frostUrl}/tokens`, options)

      const actual = getHeader(result, 'Access-Control-Allow-Origin')
      const expected = '*'

      expect(actual).to.eq(expected)
    })
  })

  describe('When get all API Tokens', function() {
    it('Should return Access-Control-Allow-Origin with *', async function() {
      const { token } = await frost.create()
      const options = getOptions(Method.GET, { token })
      const result = await fetch(`${frostUrl}/tokens`, options)

      const actual = getHeader(result, 'Access-Control-Allow-Origin')
      const expected = '*'

      expect(actual).to.eq(expected)
    })
  })

  describe('When remove an API Token', function() {
    it('Should return Access-Control-Allow-Origin with *', async function() {
      const { token } = await frost.create()
      const optionsGET = getOptions(Method.GET, { token })
      const request = await fetch(`${frostUrl}/tokens`, optionsGET)
      const { apiTokens } = await request.json()
      const optionsDEL = getOptions(Method.DEL, { token })
      const result = await fetch(`${frostUrl}/tokens/${apiTokens[0]}`, optionsDEL)

      const actual = getHeader(result, 'Access-Control-Allow-Origin')
      const expected = '*'

      expect(actual).to.eq(expected)
    })
  })
})
