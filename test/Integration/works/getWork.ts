import { Frost } from '@po.et/frost-client'
import { expect } from 'expect'
import fetch from 'node-fetch'
import { omit } from 'ramda'
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

    describe('When a newly created work with content has been sucessfully created', function() {
      it('Should return the work with a hash and about of the content', async function() {
        const user = await createUserVerified(mail, frost)
        const { token } = user
        const { apiToken } = await frost.createApiToken(token, Network.LIVE)
        const { workId } = await frost.createWork(apiToken, createWork())
        const work = await frost.getWork(apiToken, workId)
        expect(work).to.have.all.keys(
          'name',
          'datePublished',
          'dateCreated',
          'author',
          'tags',
          'hash',
          'about',
          )
        expect(work).to.not.have.key('content')
        expect(work.author).to.eql(createWork().author)
      })
    })
    describe('When a newly created work with content has been successfully created', function() {
      it.skip('Should be able to download the about', async function() {
        const user = await createUserVerified(mail, frost)
        const { token } = user
        const { apiToken } = await frost.createApiToken(token, Network.LIVE)
        const { content } = createWork()
        const { workId } = await frost.createWork(apiToken, createWork())
        const work = await frost.getWork(apiToken, workId)
        expect(work).to.have.all.keys(
          'name',
          'datePublished',
          'dateCreated',
          'author',
          'tags',
          'hash',
          'about',
          )
        expect(work).to.not.have.key('content')
        const savedText = await fetch(work.about[0]).then((res: any) => res.text())
        expect(savedText).to.eq(content)
        expect(work.hash).to.eq('QmRf22bZar3WKmojipms22PkXH1MZGmvsqzQtuSvQE3uhm')
      })
    })
    describe('When a newly createrd work with an about and a hash has been successfully created', function() {
      it('Should return the work with the provided hash and about', async function() {
        const user = await createUserVerified(mail, frost)
        const { token } = user
        const { apiToken } = await frost.createApiToken(token, Network.LIVE)
        const work = {
          ...omit(['content'], createWork()),
          about: [ 'https://example.com/myWork' ],
          hash: 'this-is-a-hash',
        }
        const { workId } = await frost.createWork(apiToken, work)
        const retrievedWork = await frost.getWork(apiToken, workId)
        expect(retrievedWork).to.have.all.keys(
          'name',
          'datePublished',
          'dateCreated',
          'author',
          'tags',
          'hash',
          'about',
        )
        expect(retrievedWork).to.not.have.key('content')
        expect(retrievedWork.about[0]).to.eq(work.about[0])
        expect(retrievedWork.hash).to.eq(work.hash)
      })
    })

    describe('When a work with an about and a hash AND content has been successfully created', function() {
      it('Should return the work with the provided hash and about', async function() {
        const user = await createUserVerified(mail, frost)
        const { token } = user
        const { apiToken } = await frost.createApiToken(token, Network.LIVE)
        const about = 'https://example.com/myWork'
        const work = {
          ...createWork(),
          about: [ about ],
          hash: 'this-is-a-hash',
        }
        const { workId } = await frost.createWork(apiToken, work)
        const retrievedWork = await frost.getWork(apiToken, workId)
        expect(retrievedWork).to.have.all.keys(
          'name',
          'datePublished',
          'dateCreated',
          'author',
          'tags',
          'hash',
          'about',
        )
        expect(retrievedWork).to.not.have.key('content')
        expect(retrievedWork.about[0]).to.eq(about)
        expect(retrievedWork.hash).to.eq('this-is-a-hash')
      })
    })

    // While retrieval will work, creating a work with extra attributes this way will not.
    describe('When work exists & has extra attributes', function() {
      it.skip('Should return the work with extra attributes', async function() {
        const user = await createUserVerified(mail, frost)
        const { token } = user
        const extra = 'something'
        const { apiToken } = await frost.createApiToken(token, Network.LIVE)
        const createdWork = Object.assign({}, createWork(), { extra })
        const { workId } = await frost.createWork(apiToken, createdWork)
        const work = await frost.getWork(apiToken, workId)
        expect(work).to.have.all.keys('name', 'datePublished', 'dateCreated', 'author', 'tags', 'content')
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
        expect(work).to.have.all.keys('name', 'datePublished', 'dateCreated', 'author', 'tags', 'hash', 'about')
      })
    })

    // While retrieval will work, creating a work with extra attributes this way will not.
    describe('When work exists & has extra attributes', function() {
      it.skip('Should return the work with extra attributes', async function() {
        const user = await createUserVerified(mail, frost)
        const { token } = user
        const extra = 'something'
        const { apiToken } = await frost.createApiToken(token, Network.TEST)
        const createdWork = Object.assign({}, createWork(), { extra })
        const { workId } = await frost.createWork(apiToken, createdWork)
        const work = await frost.getWork(apiToken, workId)
        expect(work).to.have.all.keys(
          'name',
          'datePublished',
          'dateCreated',
          'author',
          'tags',
          'hash',
          'about',
          'extra',
          )
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
