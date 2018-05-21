import { Frost } from '@po.et/frost-client'
import { expect } from 'expect'
import { Mail } from 'test/Integration/Mail'
import { deleteUser } from 'test/Integration/UserDao'
import { configuration } from 'test/Integration/configuration'
import { errorMessages } from 'test/Integration/errorMessages'
import { createUserVerified, createWork } from 'test/Integration/utils'

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

  describe('When get a work', function() {
    describe('When an account is not verified', function() {
      it(`Should send error message with '${errorMessages.accountIsNotVerified}'`, async function() {
        const response = await frost.create()
        await expect(frost.getWork(response.token, '123456')).to.be.throwWith(errorMessages.accountIsNotVerified)
      })
    })

    describe('When work exists', function() {
      it('Should return the work', async function() {
        const user = await createUserVerified(mail, frost)
        const { token } = user
        const { workId } = await frost.createWork(token, createWork())
        const work = await frost.getWork(token, workId)
        expect(work).to.have.all.keys('name', 'datePublished', 'dateCreated', 'author', 'tags', 'content')
      })
    })

    describe('When work exists & has extra attributes', function() {
      it('Should return the work with extra attributes', async function() {
        const user = await createUserVerified(mail, frost)
        const { token } = user
        const extra = 'something'
        const createdWork = Object.assign({}, createWork(), { extra })
        const { workId } = await frost.createWork(token, createdWork)
        const work = await frost.getWork(token, workId)
        expect(work).to.have.all.keys('name', 'datePublished', 'dateCreated', 'author', 'tags', 'content', 'extra')
        expect(work.extra).to.be.eq(extra)
      })
    })

    describe('When work does not exist', function() {
      it(`Should return a error message '${errorMessages.workNotFound}'`, async function() {
        const user = await createUserVerified(mail, frost)
        const { token } = user
        await expect(frost.getWork(token, 'invalidWorkId')).to.be.throwWith(errorMessages.workNotFound)
      })
    })
  })
})
