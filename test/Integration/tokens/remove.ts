import { Frost } from '@po.et/frost-client'
import { expect } from 'expect'
import { deleteUser } from 'test/Integration/UserDao'
import { errorMessages } from 'test/Integration/errorMessages'

import { configuration } from 'test/Integration/configuration'
import { Network } from 'test/Integration/utils'

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

  describe('When a user tries to remove a Live API Token', function() {
    describe('When the API token exists', function() {
      it('should return OK', async function() {
        const { token } = await frost.create()
        const { apiTokens } = await frost.getApiTokens(token)
        const response = await frost.removeApiToken(token, apiTokens[0])
        expect(response).to.eql('OK')
      })
    })

    describe('When the API token does not exist', function() {
      it(`should return an error with '${errorMessages.resourceNotExist}'`, async function() {
        const { token } = await frost.create()
        const { apiTokens } = await frost.getApiTokens(token)
        await frost.removeApiToken(token, apiTokens[0])

        await expect(frost.removeApiToken(token, apiTokens[0])).to.be.throwWith(errorMessages.resourceNotExist)
      })
    })

    describe('When a user tries to remove an API Token with a token different to login', function() {
      it(`should return an error with '${errorMessages.actionNotAllowed}'`, async function() {
        const { token } = await frost.create()
        const { apiTokens } = await frost.getApiTokens(token)
        await expect(frost.removeApiToken(apiTokens[0], apiTokens[0])).to.be.throwWith(errorMessages.actionNotAllowed)
      })
    })
  })

  describe('When a user tries to remove an Test API Token', function() {
    describe('When the API token exists', function() {
      it('should return OK', async function() {
        const { token } = await frost.create()
        const { apiToken } = await frost.createApiToken(token, Network.TEST)
        const response = await frost.removeApiToken(token, apiToken)
        expect(response).to.eql('OK')
      })
    })

    describe('When the API token does not exist', function() {
      it(`should return an error with '${errorMessages.resourceNotExist}'`, async function() {
        const { token } = await frost.create()
        const { apiToken } = await frost.createApiToken(token, Network.TEST)
        await frost.removeApiToken(token, apiToken)

        await expect(frost.removeApiToken(token, apiToken)).to.be.throwWith(errorMessages.resourceNotExist)
      })
    })

    describe('When a user tries to remove an API Token with a token different to login', function() {
      it(`should return an error with '${errorMessages.actionNotAllowed}'`, async function() {
        const { token } = await frost.create()
        const { apiToken } = await frost.createApiToken(token, Network.TEST)
        await expect(frost.removeApiToken(apiToken, apiToken)).to.be.throwWith(errorMessages.actionNotAllowed)
      })
    })
  })
})
