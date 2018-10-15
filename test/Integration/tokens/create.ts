import { Frost } from '@po.et/frost-client'
import { expect } from 'expect'
import { deleteUser } from 'test/Integration/UserDao'
import { configuration } from 'test/Integration/configuration'
import { errorMessages } from 'test/Integration/errorMessages'

import { Network } from '../../../src/interfaces/Network'

const { frostUrl, frostAccount } = configuration
const { email, password } = frostAccount

describe('Token', function() {
  const frost: Frost = new Frost({
    host: frostUrl,
    email,
    password,
  })

  beforeEach(async function() {
    await deleteUser(email)
  })

  describe('When creates a new Live token', function() {
    describe('When a user has less than 5 API Tokens', function() {
      it('should return an object with LiveApiToken', async function() {
        const response = await frost.create()
        const apiToken = await frost.createApiToken(response.token, Network.LIVE)
        expect(apiToken).to.be.an('object')
        expect(apiToken.apiToken.slice(0, 5)).to.not.eq('TEST_')
        expect(apiToken).to.have.all.keys('apiToken')
      })
    })

    describe('When a user has less than 5 API Tokens and no network defined', function() {
      it('should return an object with TestApiToken', async function() {
        const response = await frost.create()
        const apiToken = await frost.createApiToken(response.token)
        expect(apiToken).to.be.an('object')
        expect(apiToken.apiToken.slice(0, 5)).to.eq('TEST_')
        expect(apiToken).to.have.all.keys('apiToken')
      })
    })

    describe('When user has more than 5 API Tokens', function() {
      it(`should return an error with '${errorMessages.maximumTokens}'`, async function() {
        const response = await frost.create()
        const maxTokens = 5
        for (let i = 1; i <= maxTokens; i++) await frost.createApiToken(response.token, Network.LIVE)

        await expect(frost.createApiToken(response.token, Network.LIVE)).to.be.throwWith(errorMessages.maximumTokens)
      })
    })

    describe('When uses a token different to login to create an API Token', function() {
      it(`should return an error with '${errorMessages.actionNotAllowed}'`, async function() {
        const response = await frost.create()
        const apiToken = await frost.createApiToken(response.token, Network.LIVE)

        await expect(frost.createApiToken(apiToken.apiToken)).to.be.throwWith(errorMessages.actionNotAllowed)
      })
    })
  })

  describe('When creates a new Test token', function() {
    describe('When a user has less than 5 API Tokens', function() {
      it('should return an object with testApiToken', async function() {
        const response = await frost.create()
        const apiToken = await frost.createApiToken(response.token, Network.TEST)
        expect(apiToken).to.be.an('object')
        expect(apiToken.apiToken.slice(0, 5)).to.eq('TEST_')
        expect(apiToken).to.have.all.keys('apiToken')
      })
    })

    describe('When user has more than 5 API Tokens', function() {
      it(`should return an error with '${errorMessages.maximumTokens}'`, async function() {
        const response = await frost.create()
        const maxTokens = 5
        for (let i = 1; i <= maxTokens - 1; i++) await frost.createApiToken(response.token, Network.TEST)

        await expect(frost.createApiToken(response.token, Network.TEST)).to.be.throwWith(errorMessages.maximumTokens)
      })
    })

    describe('When uses a token different to login to create an API Token', function() {
      it(`should return an error with '${errorMessages.actionNotAllowed}'`, async function() {
        const response = await frost.create()
        const apiToken = await frost.createApiToken(response.token, Network.TEST)

        await expect(frost.createApiToken(apiToken.apiToken)).to.be.throwWith(errorMessages.actionNotAllowed)
      })
    })
  })
})
