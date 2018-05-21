import { Frost } from '@po.et/frost-client'
import { expect } from 'chai'
import { Mail } from 'test/Integration/Mail'
import { deleteUser } from 'test/Integration/UserDao'
import { configuration } from 'test/Integration/configuration'
import { createUserVerified, createWork, optionsGetWork, optionsCreateWork, getHeader } from 'test/Integration/utils'

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

  describe('When get all works', function() {
    features.forEach(feature => {
      it(feature.test, async function() {
        const user = await createUserVerified(mail, frost)
        const { token } = user

        const result = await fetch(`${frostUrl}/works`, optionsGetWork(token))
        expect(getHeader(result, feature.headerName)).to.eq(feature.expectedHeaderValue)
      })
    })
  })

  describe('When get one work', function() {
    features.forEach(feature => {
      it(feature.test, async function() {
        const user = await createUserVerified(mail, frost)
        const { token } = user
        const { workId } = await frost.createWork(token, createWork())

        const result = await fetch(`${frostUrl}/works/${workId}`, optionsGetWork(token))
        expect(getHeader(result, feature.headerName)).to.eq(feature.expectedHeaderValue)
      })
    })
  })

  describe('When create one work', function() {
    features.forEach(feature => {
      it(feature.test, async function() {
        const user = await createUserVerified(mail, frost)
        const { token } = user

        const result = await fetch(`${frostUrl}/works`, optionsCreateWork(token))
        expect(getHeader(result, feature.headerName)).to.eq(feature.expectedHeaderValue)
      })
    })
  })
})
