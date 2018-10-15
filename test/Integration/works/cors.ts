import { Frost } from '@po.et/frost-client'
import { expect } from 'chai'
import { Mail } from 'test/Integration/Mail'
import { deleteUser } from 'test/Integration/UserDao'
import { configuration } from 'test/Integration/configuration'
import { createUserVerified, createWork, optionsGetWork, optionsCreateWork, getHeader } from 'test/Integration/utils'
import { Network } from '../../../node_modules/@po.et/frost-client/dist/utils/utils'

const { frostUrl, frostAccount } = configuration
const { email, password } = frostAccount

describe('Works CORS', function() {
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

  const features = [
    {
      test: 'Should return Access-Control-Allow-Methods with POST,GET',
      headerName: 'Access-Control-Allow-Methods',
      expectedHeaderValue: 'POST,GET',
    },
    {
      test: 'Should return Access-Control-Allow-Headers with Content-Type,token',
      headerName: 'Access-Control-Allow-Headers',
      expectedHeaderValue: 'Content-Type,token',
    },
    {
      test: 'Should return Access-Control-Allow-Origin with *',
      headerName: 'Access-Control-Allow-Origin',
      expectedHeaderValue: '*',
    },
  ]

  describe('When get all works with testApiToken', function() {
    features.forEach(feature => {
      it(feature.test, async function() {
        const user = await createUserVerified(mail, frost)
        const { token } = user
        const { apiTokens } = await frost.getApiTokens(token)
        const result = await fetch(`${frostUrl}/works`, optionsGetWork(apiTokens[0]))
        expect(getHeader(result, feature.headerName)).to.eq(feature.expectedHeaderValue)
      })
    })
  })

  describe('When get one work with testApiToken', function() {
    features.forEach(feature => {
      it(feature.test, async function() {
        const user = await createUserVerified(mail, frost)
        const { token } = user
        const { apiTokens } = await frost.getApiTokens(token)
        const { workId } = await frost.createWork(apiTokens[0], createWork())

        const result = await fetch(`${frostUrl}/works/${workId}`, optionsGetWork(apiTokens[0]))
        expect(getHeader(result, feature.headerName)).to.eq(feature.expectedHeaderValue)
      })
    })
  })

  describe('When create one work with testApiToken', function() {
    features.forEach(feature => {
      it(feature.test, async function() {
        const user = await createUserVerified(mail, frost)
        const { token } = user
        const { apiTokens } = await frost.getApiTokens(token)

        const result = await fetch(`${frostUrl}/works`, optionsCreateWork(apiTokens[0]))
        expect(getHeader(result, feature.headerName)).to.eq(feature.expectedHeaderValue)
      })
    })
  })

  describe('When get all works with ApiToken', function() {
    features.forEach(feature => {
      it(feature.test, async function() {
        const user = await createUserVerified(mail, frost)
        const { token } = user
        const { apiToken } = await frost.createApiToken(token, Network.LIVE)
        const result = await fetch(`${frostUrl}/works`, optionsGetWork(apiToken))
        expect(getHeader(result, feature.headerName)).to.eq(feature.expectedHeaderValue)
      })
    })
  })

  describe('When get one work with ApiToken', function() {
    features.forEach(feature => {
      it(feature.test, async function() {
        const user = await createUserVerified(mail, frost)
        const { token } = user
        const { apiToken } = await frost.createApiToken(token, Network.LIVE)
        const { workId } = await frost.createWork(apiToken, createWork())

        const result = await fetch(`${frostUrl}/works/${workId}`, optionsGetWork(apiToken))
        expect(getHeader(result, feature.headerName)).to.eq(feature.expectedHeaderValue)
      })
    })
  })

  describe('When create one work with ApiToken', function() {
    features.forEach(feature => {
      it(feature.test, async function() {
        const user = await createUserVerified(mail, frost)
        const { token } = user
        const { apiToken } = await frost.createApiToken(token, Network.LIVE)

        const result = await fetch(`${frostUrl}/works`, optionsCreateWork(apiToken))
        expect(getHeader(result, feature.headerName)).to.eq(feature.expectedHeaderValue)
      })
    })
  })
})
