import { Frost } from '@po.et/frost-client'
import { expect } from 'expect'
import { Mail } from 'test/Integration/Mail'
import { deleteUser } from 'test/Integration/UserDao'
import { configuration } from 'test/Integration/configuration'
import { errorMessages } from 'test/Integration/errorMessages'
import {
  createUserVerified,
  createWork,
  createWorkEmptyTags,
  createWorkNoTags,
  createWorkWrong,
  createWorkNoText,
} from 'test/Integration/utils'
import { Network } from '../../../src/interfaces/Network'

const { frostUrl, frostAccount } = configuration
const { email, password } = frostAccount

describe('Works', function() {
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

  describe('When create a new work', function() {
    describe('When account is verified', function() {
      describe('When ApiToken is valid and work is right', function() {
        it('Should return workId', async function() {
          const user = await createUserVerified(mail, frost)
          const { token } = user
          const { apiToken } = await frost.createApiToken(token, Network.LIVE)

          const response = await frost.createWork(apiToken, createWork())

          expect(response).to.have.property('workId')
          expect(response.workId).to.be.a('string')
        })
      })

      describe('When ApiToken is valid and the work has date wrong', function() {
        it(`Should return a message with '${errorMessages.badDate}'`, async function() {
          const user = await createUserVerified(mail, frost)
          const { token } = user
          const { apiToken } = await frost.createApiToken(token, Network.LIVE)

          await expect(frost.createWork(apiToken, createWorkWrong())).to.be.throwWith(errorMessages.badDate)
        })
      })

      describe('When ApiToken is valid and work has no text field', function() {
        it('Should return workId', async function() {
          const user = await createUserVerified(mail, frost)
          const { token } = user
          const { apiToken } = await frost.createApiToken(token, Network.LIVE)

          const response = await frost.createWork(apiToken, createWorkNoText())
          expect(response).to.have.property('workId')
          expect(response.workId).to.be.a('string')
        })
      })

      describe('When testApiToken is valid and work is right', function() {
        it('Should return workId', async function() {
          const user = await createUserVerified(mail, frost)
          const { token } = user
          const { apiToken } = await frost.createApiToken(token, Network.TEST)

          const response = await frost.createWork(apiToken, createWork())

          expect(response).to.have.property('workId')
          expect(response.workId).to.be.a('string')
        })
      })

      describe('When testApiToken is valid and the work has date wrong', function() {
        it(`Should return a message with '${errorMessages.badDate}'`, async function() {
          const user = await createUserVerified(mail, frost)
          const { token } = user
          const { apiToken } = await frost.createApiToken(token, Network.TEST)

          await expect(frost.createWork(apiToken, createWorkWrong())).to.be.throwWith(errorMessages.badDate)
        })
      })

      describe('When works empty tags', function() {
        it('Should return workId', async function() {
          const user = await createUserVerified(mail, frost)
          const { token } = user
          const { apiToken } = await frost.createApiToken(token, Network.LIVE)

          const response = await frost.createWork(apiToken, createWorkEmptyTags())

          expect(response).to.have.property('workId')
          expect(response.workId).to.be.a('string')
        })
      })

      describe('When works is too large', function() {
        it(`should return a message with '${errorMessages.payloadTooLarge}'`, async () => {
          const user = await createUserVerified(mail, frost)
          const { token } = user
          const { apiToken } = await frost.createApiToken(token, Network.LIVE)

          const contentBuffer = Buffer.alloc(1024 * 100)
          const content = contentBuffer.toString()

          await expect(frost.createWork(apiToken, createWork({ content })))
            .to.be.throwWith(errorMessages.payloadTooLarge)
        })
      })

      describe('When works without tags', function() {
        it('Should return workId', async function() {
          const user = await createUserVerified(mail, frost)
          const { token } = user
          const { apiToken } = await frost.createApiToken(token, Network.LIVE)

          const response = await frost.createWork(apiToken, createWorkNoTags())

          expect(response).to.have.property('workId')
          expect(response.workId).to.be.a('string')
        })
      })
    })

    describe('When account do not verified', function() {
      it(`Should send error message with '${errorMessages.accountIsNotVerified}'`, async () => {
        const user = await frost.create()
        const { token } = user
        const { apiToken } = await frost.createApiToken(token, Network.LIVE)

        await expect(frost.createWork(apiToken, createWork())).to.be.throwWith(errorMessages.accountIsNotVerified)
      })
    })

    describe('When token do not valid', function() {
      it(`should return a message with '${errorMessages.invalidToken}'`, async () => {
        await expect(frost.createWork('invalid-token', createWork())).to.be.throwWith(errorMessages.invalidToken)
      })
    })
  })
})
