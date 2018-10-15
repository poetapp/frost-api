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

  describe('When get a work with API Token', function() {
    describe('When an account is not verified', function() {
      it(`Should send error message with '${errorMessages.accountIsNotVerified}'`, async function() {
        const response = await frost.create()
        const { apiToken } = await frost.createApiToken(response.token, Network.LIVE)
        await expect(frost.getWork(apiToken, '123456')).to.be.throwWith(errorMessages.accountIsNotVerified)
      })
    })

    describe('When work exists', function() {
      it('Should return the work', async function() {
        const user = await createUserVerified(mail, frost)
        const { token } = user
        const { apiToken } = await frost.createApiToken(token, Network.LIVE)
        const { workId } = await frost.createWork(apiToken, createWork())
        const work = await frost.getWork(apiToken, workId)
        expect(work).to.have.all.keys('name', 'datePublished', 'dateCreated', 'author', 'tags', 'text')
      })
    })

    describe('When work exists & has extra attributes', function() {
      it('Should return the work with extra attributes', async function() {
        const user = await createUserVerified(mail, frost)
        const { token } = user
        const extra = 'something'
        const { apiToken } = await frost.createApiToken(token, Network.LIVE)
        const createdWork = Object.assign({}, createWork(), { extra })
        const { workId } = await frost.createWork(apiToken, createdWork)
        const work = await frost.getWork(apiToken, workId)
        expect(work).to.have.all.keys('name', 'datePublished', 'dateCreated', 'author', 'tags', 'text', 'extra')
        expect(work.extra).to.be.eq(extra)
      })
    })

    describe('When work does not exist', function() {
      it(`Should return a error message '${errorMessages.workNotFound}'`, async function() {
        const user = await createUserVerified(mail, frost)
        const { token } = user
        const { apiToken } = await frost.createApiToken(token, Network.LIVE)
        await expect(frost.getWork(apiToken, 'invalidWorkId')).to.be.throwWith(errorMessages.workNotFound)
      })
    })
  })

  describe('When get a work with testToken', function() {
    describe('When an account is not verified', function() {
      it(`Should send error message with '${errorMessages.accountIsNotVerified}'`, async function() {
        const response = await frost.create()
        const { apiToken } = await frost.createApiToken(response.token, Network.TEST)
        await expect(frost.getWork(apiToken, '123456')).to.be.throwWith(errorMessages.accountIsNotVerified)
      })
    })

    describe('When work exists', function() {
      it('Should return the work', async function() {
        const user = await createUserVerified(mail, frost)
        const { token } = user
        const { apiToken } = await frost.createApiToken(token, Network.TEST)
        const { workId } = await frost.createWork(apiToken, createWork())
        const work = await frost.getWork(apiToken, workId)
        expect(work).to.have.all.keys('name', 'datePublished', 'dateCreated', 'author', 'tags', 'text')
      })
    })

    describe('When work exists & has extra attributes', function() {
      it('Should return the work with extra attributes', async function() {
        const user = await createUserVerified(mail, frost)
        const { token } = user
        const extra = 'something'
        const { apiToken } = await frost.createApiToken(token, Network.TEST)
        const createdWork = Object.assign({}, createWork(), { extra })
        const { workId } = await frost.createWork(apiToken, createdWork)
        const work = await frost.getWork(apiToken, workId)
        expect(work).to.have.all.keys('name', 'datePublished', 'dateCreated', 'author', 'tags', 'text', 'extra')
        expect(work.extra).to.be.eq(extra)
      })
    })

    describe('When work does not exist', function() {
      it(`Should return a error message '${errorMessages.workNotFound}'`, async function() {
        const user = await createUserVerified(mail, frost)
        const { token } = user
        const { apiToken } = await frost.createApiToken(token, Network.LIVE)
        await expect(frost.getWork(apiToken, 'invalidWorkId')).to.be.throwWith(errorMessages.workNotFound)
      })
    })
  })
})
