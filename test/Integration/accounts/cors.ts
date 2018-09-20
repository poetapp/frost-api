import { getOptions } from '@po.et/frost-client'
import { expect } from 'chai'
import { Mail } from 'test/Integration/Mail'
import { deleteUser } from 'test/Integration/UserDao'
import { configuration } from 'test/Integration/configuration'
import { getHeader, getDataVerifiedAccount, getTokenResetPassword, Method } from 'test/Integration/utils'
const { frostUrl, frostAccount } = configuration
const { email, password } = frostAccount

const options = getOptions(Method.POST, {}, { email, password })
const optionsResetpassword = (email: string) => getOptions(Method.POST, {}, { email })
const optionsWithToken = (token: string) => getOptions(Method.POST, { token }, { email, password })
const optionsResetpasswordToken = (token: string, password: string) => getOptions(Method.POST, { token }, { password })
const optionsPasswordChange = (token: string, password: string, oldPassword: string) =>
  getOptions(Method.POST, { token }, { password, oldPassword })

describe('Accounts CORS', function() {
  const mail = new Mail()

  beforeEach(async function() {
    await deleteUser(email)
    await mail.removeAll()
  })

  describe('When create an account', function() {
    it('Should return Access-Control-Allow-Origin with *', async function() {
      const result = await fetch(`${frostUrl}/accounts`, options)

      const actual = getHeader(result, 'Access-Control-Allow-Origin')
      const expected = '*'

      expect(actual).to.eq(expected)
    })
  })

  describe('When login', function() {
    it('Should return Access-Control-Allow-Origin with *', async function() {
      await fetch(`${frostUrl}/accounts`, options)
      const result = await fetch(`${frostUrl}/login`, options)

      const actual = getHeader(result, 'Access-Control-Allow-Origin')
      const expected = '*'

      expect(actual).to.eq(expected)
    })
  })

  describe('When get profile account', function() {
    it('Should return Access-Control-Allow-Origin with *', async function() {
      await fetch(`${frostUrl}/accounts`, options)
      const result = await fetch(`${frostUrl}/accounts/profile`, options)

      const actual = getHeader(result, 'Access-Control-Allow-Origin')
      const expected = '*'

      expect(actual).to.eq(expected)
    })
  })

  describe('When an account is verifying', function() {
    it('Should return Access-Control-Allow-Origin with *', async function() {
      const request = await fetch(`${frostUrl}/accounts`, options)
      const { token } = await request.json()
      const result = await fetch(`${frostUrl}/accounts/verify`, optionsWithToken(token))

      const actual = getHeader(result, 'Access-Control-Allow-Origin')
      const expected = '*'

      expect(actual).to.eq(expected)
    })
  })

  describe('When an account is verifying with the token', function() {
    it('Should return Access-Control-Allow-Origin with *', async function() {
      await fetch(`${frostUrl}/accounts`, options)
      const { token } = await getDataVerifiedAccount(mail)
      const result = await fetch(`${frostUrl}/accounts/verify${token}`, options)

      const actual = getHeader(result, 'Access-Control-Allow-Origin')
      const expected = '*'

      expect(actual).to.eq(expected)
    })
  })

  describe('When an account tries to reset the password', function() {
    it('Should return Access-Control-Allow-Origin with *', async function() {
      await fetch(`${frostUrl}/accounts`, options)
      const result = await fetch(`${frostUrl}/password/reset`, optionsResetpassword(email))

      const actual = getHeader(result, 'Access-Control-Allow-Origin')
      const expected = '*'

      expect(actual).to.eq(expected)
    })
  })

  describe('When an account tries to reset the password with the token', function() {
    it('Should return Access-Control-Allow-Origin with *', async function() {
      await fetch(`${frostUrl}/accounts`, options)
      await mail.removeAll()
      await fetch(`${frostUrl}/password/reset`, optionsResetpassword(email))

      const token = await getTokenResetPassword(mail)
      const result = await fetch(`${frostUrl}/password/change/token`, optionsResetpasswordToken(token, password))

      const actual = getHeader(result, 'Access-Control-Allow-Origin')
      const expected = '*'

      expect(actual).to.eq(expected)
    })
  })

  describe('When an account tries to change the password', function() {
    it('Should return Access-Control-Allow-Origin with *', async function() {
      const request = await fetch(`${frostUrl}/accounts`, options)
      const { token } = await request.json()

      const result = await fetch(`${frostUrl}/password/change`, optionsPasswordChange(token, password, password))

      const actual = getHeader(result, 'Access-Control-Allow-Origin')
      const expected = '*'

      expect(actual).to.eq(expected)
    })
  })
})
