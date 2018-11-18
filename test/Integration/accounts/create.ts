import { Frost } from '@po.et/frost-client'
import { expect } from 'expect'
import { Mail } from 'test/Integration/Mail'
import { deleteUser } from 'test/Integration/UserDao'
import { configuration } from 'test/Integration/configuration'
import { errorMessages } from 'test/Integration/errorMessages'
import { getDataVerifiedAccount } from 'test/Integration/utils'

const { frostUrl, frostAccount } = configuration
const { email, password } = frostAccount

describe('Account', function() {
  const mail = new Mail()
  const frost: Frost = new Frost({
    host: frostUrl,
    email,
    password,
  })

  beforeEach(async function() {
    await deleteUser(email)
    await mail.removeAll()
  })

  describe('When create a new account', function() {
    describe('When an account does not exist', function() {
      describe('When a password satisfies the security level', () => {
        it('should return an email verified', async function() {
          await frost.create()
          const [message] = await mail.getEmails()

          expect(message.subject).to.eq('Po.et Verify account')
          expect(message.from[0].name).to.eq('Po.et')
        })
      })

      describe('When a password does not satisfy the security level', () => {
        const features = [
          {
            context: 'When the password length is less than 10',
            value: '123456789',
          },
          {
            context: 'When password does not contain a symbol',
            value: '123456789',
          },
          {
            context: 'When password does not contain a uppercase letter',
            value: '1234567891',
          },
          {
            context: 'When password does not contain a lowercase letter',
            value: 'A$1234567891',
          },
          {
            context: 'When password is greater than 30',
            value: 'aA$1234567891111111111111111111',
          },
        ]

        features.forEach(feature => {
          describe(feature.context, () => {
            it(`should return an error message with 'One of the inputs is not valid...'`, async function() {
              await expect(frost.create(email, feature.value)).to.be.throwWith(errorMessages.inputsNotValid)
            })
          })
        })
      })
    })

    describe('When an account does not exist and it is not verified', function() {
      it(`should return a login token`, async function() {
        await frost.create()
        const { token } = await getDataVerifiedAccount(mail)
        const verify = await frost.verifyAccount(token)
        expect(verify.token).to.be.a('string')
      })
    })

    describe('When an account does not exist and verify again', function() {
      it(`should return a message with '${errorMessages.emailVerified}'`, async function() {
        const expected = errorMessages.emailVerified
        await frost.create()
        const { token } = await getDataVerifiedAccount(mail)
        await frost.verifyAccount(token)
        await expect(frost.verifyAccount(token)).to.be.throwWith(expected)
      })
    })

    describe('When an account does not exist and tries to verify with a bad token', function() {
      it(`should return a message with '${errorMessages.invalidToken}'`, async function() {
        const expected = errorMessages.invalidToken
        await frost.create()
        const { token } = await getDataVerifiedAccount(mail)

        await frost.verifyAccount(token)
        const splittoken = token.split('/')
        splittoken[splittoken.length - 1] = 'bad-token'
        const jointoken = splittoken.join('/')

        await expect(frost.verifyAccount(jointoken)).to.be.throwWith(expected)
      })
    })
  })
})
