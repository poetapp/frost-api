import { Frost } from '@po.et/frost-client'
import { expect } from 'expect'
import { deleteUser } from 'test/Integration/UserDao'
import { configuration } from 'test/Integration/configuration'
import { errorMessages } from 'test/Integration/errorMessages'

const { frostUrl, frostAccount } = configuration
const { email, password } = frostAccount

describe('Login', function() {
  const host = frostUrl

  beforeEach(async function() {
    await deleteUser(email)
  })

  describe('When an account exists', function() {
    describe('When email and password are right', function() {
      it('should return a token', async function() {
        const frost = new Frost({ host, email, password })
        await frost.create()

        const response = await frost.login()
        expect(response.token).to.be.a('string')
      })
    })

    describe('When email is wrong', function() {
      it(`should return a message with '${errorMessages.resourceNotExist}'`, async function() {
        const frost = new Frost({
          host,
          email: 'apitestpoet@wrong.com',
          password: '123456',
        })

        await expect(frost.login()).to.be.throwWith(errorMessages.resourceNotExist)
      })
    })

    describe('When password is wrong', function() {
      it(`should return a message with '${errorMessages.resourceNotExist}'`, async function() {
        const frost = new Frost({ host, email, password: '1234567' })
        await expect(frost.login()).to.be.throwWith(errorMessages.resourceNotExist)
      })
    })
  })

  describe('When account does not exist', function() {
    it(`should return a message with '${errorMessages.resourceNotExist}'`, async function() {
      const frost = new Frost({
        host,
        email: 'no@exists.com',
        password: '1234567',
      })

      await expect(frost.login()).to.be.throwWith(errorMessages.resourceNotExist)
    })
  })
})
