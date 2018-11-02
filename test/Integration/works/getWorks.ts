import { Frost } from '@po.et/frost-client'
import { expect } from 'expect'
import { Mail } from 'test/Integration/Mail'
import { deleteUser } from 'test/Integration/UserDao'
import { configuration } from 'test/Integration/configuration'
import { errorMessages } from 'test/Integration/errorMessages'
import { createUserVerified, createWork } from 'test/Integration/utils'
import { Network } from '../../../src/interfaces/Network'

const { frostUrl, frostAccount } = configuration
const { email, password } = frostAccount

describe('Works', async function() {
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

  describe('When get all works', function() {
    describe('When an account is not verified', function() {
      it(`Should send error message with '${errorMessages.accountIsNotVerified}'`, async function() {
        const response = await frost.create()
        const { apiToken } = await frost.createApiToken(response.token, Network.LIVE)
        await expect(frost.getWorks(apiToken)).to.be.throwWith(errorMessages.accountIsNotVerified)
      })
    })

    describe('When works is empty', function() {
      it('Should return 0 works', async function() {
        const user = await createUserVerified(mail, frost)
        const { token } = user
        const { apiToken } = await frost.createApiToken(token, Network.LIVE)

        const works = await frost.getWorks(apiToken)
        expect(works.length).to.eql(0)
      })
    })

    describe('When there are 2 work', function() {
      it('Should return 2 works', async function() {
        const user = await createUserVerified(mail, frost)
        const { token } = user
        const { apiToken } = await frost.createApiToken(token, Network.LIVE)
        await frost.createWork(apiToken, createWork())
        await frost.createWork(apiToken, createWork())

        const works = await frost.getWorks(apiToken)
        expect(works.length).to.eql(2)
        expect(works[0]).to.have.all.keys('name', 'datePublished', 'dateCreated', 'author', 'tags', 'content')
        expect(works[1]).to.have.all.keys('name', 'datePublished', 'dateCreated', 'author', 'tags', 'content')
      })
    })
  })

  describe('When get all works with testApiToken', function() {
    describe('When an account is not verified', function() {
      it(`Should send error message with '${errorMessages.accountIsNotVerified}'`, async function() {
        const response = await frost.create()
        const { apiToken } = await frost.createApiToken(response.token, Network.TEST)
        await expect(frost.getWorks(apiToken)).to.be.throwWith(errorMessages.accountIsNotVerified)
      })
    })

    describe('When works is empty', function() {
      it('Should return 0 works', async function() {
        const user = await createUserVerified(mail, frost)
        const { token } = user
        const { apiToken } = await frost.createApiToken(token, Network.TEST)

        const works = await frost.getWorks(apiToken)
        expect(works.length).to.eql(0)
      })
    })

    describe('When there are 2 work', function() {
      it('Should return 2 works', async function() {
        const user = await createUserVerified(mail, frost)
        const { token } = user
        const { apiToken } = await frost.createApiToken(token, Network.TEST)
        await frost.createWork(apiToken, createWork())
        await frost.createWork(apiToken, createWork())

        const works = await frost.getWorks(apiToken)
        expect(works.length).to.eql(2)
        expect(works[0]).to.have.all.keys('name', 'datePublished', 'dateCreated', 'author', 'tags', 'content')
        expect(works[1]).to.have.all.keys('name', 'datePublished', 'dateCreated', 'author', 'tags', 'content')
      })
    })
  })
})
