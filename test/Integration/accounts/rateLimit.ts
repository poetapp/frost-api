import { getOptions } from '@po.et/frost-client'
import { expect } from 'chai'
import { Mail } from 'test/Integration/Mail'
import { deleteUser } from 'test/Integration/UserDao'
import { configuration } from 'test/Integration/configuration'
import { getHeader, getTokenResetPassword, Method } from 'test/Integration/utils'
const {
  frostUrl,
  frostAccount,
  loginRateLimitMax,
  createAccountRateLimitMax,
  passwordChangeRateLimitMax,
  rateLimitDisabled,
} = configuration

const { email, password } = frostAccount
const options = getOptions(Method.POST, {}, { email, password })
const optionsResetpassword = (email: string) => getOptions(Method.POST, {}, { email })
const optionsResetpasswordToken = (token: string, password: string) => getOptions(Method.POST, { token }, { password })
const optionsPasswordChange = (token: string, password: string, oldPassword: string) =>
  getOptions(Method.POST, { token }, { password, oldPassword })

if (!rateLimitDisabled)
  describe('RateLimit', function() {
    const mail = new Mail()

    beforeEach(async function() {
      await deleteUser(email)
      await mail.removeAll()
    })

    describe('When create an account', function() {
      it('Should return X-Rate-Limit-Limit with limit max', async function() {
        const result = await fetch(`${frostUrl}/accounts`, options)

        const actual = parseInt(getHeader(result, 'X-Rate-Limit-Limit'), 10)
        const expected = createAccountRateLimitMax
        expect(actual).to.eq(expected)
      })

      it('Should return X-Rate-Limit-Remaining with limit remaining less than limit max', async function() {
        const result = await fetch(`${frostUrl}/accounts`, options)

        const actual = parseInt(getHeader(result, 'X-Rate-Limit-Remaining'), 10)
        const expected = createAccountRateLimitMax
        expect(actual).to.be.lessThan(expected)
      })

      it('Should return X-Rate-Limit-Reset Date Greater than Now', async function() {
        const result = await fetch(`${frostUrl}/accounts`, options)

        const actual = new Date(parseInt(getHeader(result, 'X-Rate-Limit-Reset'), 10) * 1000)
        const expected = new Date()
        expect(actual).to.be.greaterThan(expected)
      })
    })

    describe('When login', function() {
      it('Should return X-Rate-Limit-Limit with limit max', async function() {
        await fetch(`${frostUrl}/accounts`, options)
        const result = await fetch(`${frostUrl}/login`, options)

        const actual = parseInt(getHeader(result, 'X-Rate-Limit-Limit'), 10)
        const expected = loginRateLimitMax
        expect(actual).to.eq(expected)
      })

      it('Should return X-Rate-Limit-Remaining with limit remaining less than limit max', async function() {
        await fetch(`${frostUrl}/accounts`, options)
        const result = await fetch(`${frostUrl}/login`, options)

        const actual = parseInt(getHeader(result, 'X-Rate-Limit-Remaining'), 10)
        const expected = loginRateLimitMax
        expect(actual).to.be.lessThan(expected)
      })

      it('Should return X-Rate-Limit-Reset Date Greater than Now', async function() {
        await fetch(`${frostUrl}/accounts`, options)
        const result = await fetch(`${frostUrl}/login`, options)

        const actual = new Date(parseInt(getHeader(result, 'X-Rate-Limit-Reset'), 10) * 1000)
        const expected = new Date()
        expect(actual).to.be.greaterThan(expected)
      })
    })

    describe('When an account tries to reset the password', function() {
      it('Should return X-Rate-Limit-Limit with limit max', async function() {
        await fetch(`${frostUrl}/accounts`, options)
        const result = await fetch(`${frostUrl}/password/reset`, optionsResetpassword(email))

        const actual = parseInt(getHeader(result, 'X-Rate-Limit-Limit'), 10)
        const expected = passwordChangeRateLimitMax
        expect(actual).to.eq(expected)
      })

      it('Should return X-Rate-Limit-Remaining with limit remaining less than limit max', async function() {
        await fetch(`${frostUrl}/accounts`, options)
        const result = await fetch(`${frostUrl}/password/reset`, optionsResetpassword(email))

        const actual = parseInt(getHeader(result, 'X-Rate-Limit-Remaining'), 10)
        const expected = passwordChangeRateLimitMax
        expect(actual).to.be.lessThan(expected)
      })

      it('Should return X-Rate-Limit-Reset Date Greater than Now', async function() {
        await fetch(`${frostUrl}/accounts`, options)
        const result = await fetch(`${frostUrl}/password/reset`, optionsResetpassword(email))

        const actual = new Date(parseInt(getHeader(result, 'X-Rate-Limit-Reset'), 10) * 1000)
        const expected = new Date()
        expect(actual).to.be.greaterThan(expected)
      })
    })

    describe('When an account tries to reset the password with the token', function() {
      it('Should return X-Rate-Limit-Limit with limit max', async function() {
        await fetch(`${frostUrl}/accounts`, options)
        await mail.removeAll()
        await fetch(`${frostUrl}/password/reset`, optionsResetpassword(email))

        const token = await getTokenResetPassword(mail)
        const result = await fetch(`${frostUrl}/password/change/token`, optionsResetpasswordToken(token, password))

        const actual = parseInt(getHeader(result, 'X-Rate-Limit-Limit'), 10)
        const expected = passwordChangeRateLimitMax
        expect(actual).to.eq(expected)
      })

      it('Should return X-Rate-Limit-Remaining with limit remaining less than limit max', async function() {
        await fetch(`${frostUrl}/accounts`, options)
        await mail.removeAll()
        await fetch(`${frostUrl}/password/reset`, optionsResetpassword(email))

        const token = await getTokenResetPassword(mail)
        const result = await fetch(`${frostUrl}/password/change/token`, optionsResetpasswordToken(token, password))

        const actual = parseInt(getHeader(result, 'X-Rate-Limit-Remaining'), 10)
        const expected = passwordChangeRateLimitMax
        expect(actual).to.be.lessThan(expected)
      })

      it('Should return X-Rate-Limit-Reset Date Greater than Now', async function() {
        await fetch(`${frostUrl}/accounts`, options)
        await mail.removeAll()
        await fetch(`${frostUrl}/password/reset`, optionsResetpassword(email))

        const token = await getTokenResetPassword(mail)
        const result = await fetch(`${frostUrl}/password/change/token`, optionsResetpasswordToken(token, password))

        const actual = new Date(parseInt(getHeader(result, 'X-Rate-Limit-Reset'), 10) * 1000)
        const expected = new Date()
        expect(actual).to.be.greaterThan(expected)
      })
    })

    describe('When an account tries to change the password', function() {
      it('Should return X-Rate-Limit-Limit with limit max', async function() {
        const request = await fetch(`${frostUrl}/accounts`, options)
        const { token } = await request.json()

        const result = await fetch(`${frostUrl}/password/change`, optionsPasswordChange(token, password, password))

        const actual = parseInt(getHeader(result, 'X-Rate-Limit-Limit'), 10)
        const expected = passwordChangeRateLimitMax
        expect(actual).to.eq(expected)
      })

      it('Should return X-Rate-Limit-Remaining with limit remaining less than limit max', async function() {
        const request = await fetch(`${frostUrl}/accounts`, options)
        const { token } = await request.json()

        const result = await fetch(`${frostUrl}/password/change`, optionsPasswordChange(token, password, password))

        const actual = parseInt(getHeader(result, 'X-Rate-Limit-Remaining'), 10)
        const expected = passwordChangeRateLimitMax
        expect(actual).to.be.lessThan(expected)
      })

      it('Should return X-Rate-Limit-Reset Date Greater than Now', async function() {
        const request = await fetch(`${frostUrl}/accounts`, options)
        const { token } = await request.json()

        const result = await fetch(`${frostUrl}/password/change`, optionsPasswordChange(token, password, password))

        const actual = new Date(parseInt(getHeader(result, 'X-Rate-Limit-Reset'), 10) * 1000)
        const expected = new Date()
        expect(actual).to.be.greaterThan(expected)
      })
    })
  })
else
  describe('RateLimit Disabled', function() {
    const mail = new Mail()

    beforeEach(async function() {
      await deleteUser(email)
      await mail.removeAll()
    })

    describe('When create an account', function() {
      it('Should not return X-Rate-Limit-Limit', async function() {
        const result = await fetch(`${frostUrl}/accounts`, options)

        const actual = getHeader(result, 'X-Rate-Limit-Limit')
        expect(actual).to.eq(null)
      })

      it('Should not return X-Rate-Limit-Remaining', async function() {
        const result = await fetch(`${frostUrl}/accounts`, options)

        const actual = getHeader(result, 'X-Rate-Limit-Remaining')
        expect(actual).to.eq(null)
      })

      it('Should not return X-Rate-Limit-Reset', async function() {
        const result = await fetch(`${frostUrl}/accounts`, options)

        const actual = getHeader(result, 'X-Rate-Limit-Reset')
        expect(actual).to.eq(null)
      })
    })

    describe('When login', function() {
      it('Should not return X-Rate-Limit-Limit', async function() {
        await fetch(`${frostUrl}/accounts`, options)
        const result = await fetch(`${frostUrl}/login`, options)

        const actual = getHeader(result, 'X-Rate-Limit-Limit')
        expect(actual).to.eq(null)
      })

      it('Should not return X-Rate-Limit-Remaining', async function() {
        await fetch(`${frostUrl}/accounts`, options)
        const result = await fetch(`${frostUrl}/login`, options)

        const actual = getHeader(result, 'X-Rate-Limit-Remaining')
        expect(actual).to.eq(null)
      })

      it('Should not return X-Rate-Limit-Reset', async function() {
        await fetch(`${frostUrl}/accounts`, options)
        const result = await fetch(`${frostUrl}/login`, options)

        const actual = getHeader(result, 'X-Rate-Limit-Reset')
        expect(actual).to.eq(null)
      })
    })

    describe('When an account tries to reset the password', function() {
      it('Should not return X-Rate-Limit-Limit', async function() {
        await fetch(`${frostUrl}/accounts`, options)
        const result = await fetch(`${frostUrl}/password/reset`, optionsResetpassword(email))

        const actual = getHeader(result, 'X-Rate-Limit-Limit')
        expect(actual).to.eq(null)
      })

      it('Should not return X-Rate-Limit-Remaining', async function() {
        await fetch(`${frostUrl}/accounts`, options)
        const result = await fetch(`${frostUrl}/password/reset`, optionsResetpassword(email))

        const actual = getHeader(result, 'X-Rate-Limit-Remaining')
        expect(actual).to.eq(null)
      })

      it('Should not return X-Rate-Limit-Reset', async function() {
        await fetch(`${frostUrl}/accounts`, options)
        const result = await fetch(`${frostUrl}/password/reset`, optionsResetpassword(email))

        const actual = getHeader(result, 'X-Rate-Limit-Reset')
        expect(actual).to.eq(null)
      })
    })

    describe('When an account tries to reset the password with the token', function() {
      it('Should not return X-Rate-Limit-Limit', async function() {
        await fetch(`${frostUrl}/accounts`, options)
        await mail.removeAll()
        await fetch(`${frostUrl}/password/reset`, optionsResetpassword(email))

        const token = await getTokenResetPassword(mail)
        const result = await fetch(`${frostUrl}/password/change/token`, optionsResetpasswordToken(token, password))

        const actual = getHeader(result, 'X-Rate-Limit-Limit')
        expect(actual).to.eq(null)
      })

      it('Should not return X-Rate-Limit-Remaining', async function() {
        await fetch(`${frostUrl}/accounts`, options)
        await mail.removeAll()
        await fetch(`${frostUrl}/password/reset`, optionsResetpassword(email))

        const token = await getTokenResetPassword(mail)
        const result = await fetch(`${frostUrl}/password/change/token`, optionsResetpasswordToken(token, password))

        const actual = getHeader(result, 'X-Rate-Limit-Remaining')
        expect(actual).to.eq(null)
      })

      it('Should not return X-Rate-Limit-Reset', async function() {
        await fetch(`${frostUrl}/accounts`, options)
        await mail.removeAll()
        await fetch(`${frostUrl}/password/reset`, optionsResetpassword(email))

        const token = await getTokenResetPassword(mail)
        const result = await fetch(`${frostUrl}/password/change/token`, optionsResetpasswordToken(token, password))

        const actual = getHeader(result, 'X-Rate-Limit-Reset')
        expect(actual).to.eq(null)
      })
    })

    describe('When an account tries to change the password', function() {
      it('Should not return X-Rate-Limit-Limit', async function() {
        const request = await fetch(`${frostUrl}/accounts`, options)
        const { token } = await request.json()

        const result = await fetch(`${frostUrl}/password/change`, optionsPasswordChange(token, password, password))

        const actual = getHeader(result, 'X-Rate-Limit-Limit')
        expect(actual).to.eq(null)
      })

      it('Should not return X-Rate-Limit-Remaining', async function() {
        const request = await fetch(`${frostUrl}/accounts`, options)
        const { token } = await request.json()

        const result = await fetch(`${frostUrl}/password/change`, optionsPasswordChange(token, password, password))

        const actual = getHeader(result, 'X-Rate-Limit-Remaining')
        expect(actual).to.eq(null)
      })

      it('Should not return X-Rate-Limit-Reset', async function() {
        const request = await fetch(`${frostUrl}/accounts`, options)
        const { token } = await request.json()

        const result = await fetch(`${frostUrl}/password/change`, optionsPasswordChange(token, password, password))

        const actual = getHeader(result, 'X-Rate-Limit-Reset')
        expect(actual).to.eq(null)
      })
    })
  })
