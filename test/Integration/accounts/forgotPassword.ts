import { Frost } from '@po.et/frost-client'
import { expect } from 'expect'
import { Mail } from 'test/Integration/Mail'
import { deleteUser } from 'test/Integration/UserDao'
import { errorMessages } from 'test/Integration/errorMessages'

import { configuration } from 'test/Integration/configuration'
import { createUserVerified, getTokenResetPassword } from 'test/Integration/utils'

const { frostUrl, frostAccount } = configuration
const { email, password } = frostAccount

describe('Forgot Password', function() {
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

  describe('When an account exists', function() {
    it('should return a token', async function() {
      await frost.create()
      await mail.removeAll()
      await frost.sendEmailForgotPassword()
      const token = await getTokenResetPassword(mail)

      expect(token).to.be.a('string')
    })

    describe('When a user tries to change his password and the account is already verified', function() {
      const newPassword = 'Ae%12345678'

      it('Should log in with the new password and get a token', async function() {
        await createUserVerified(mail, frost)
        await mail.removeAll()
        await frost.sendEmailForgotPassword()
        const token = await getTokenResetPassword(mail)
        await frost.changePasswordWithToken(token, newPassword)
        const response = await frost.login(email, newPassword)

        expect(response.token).to.be.a('string')
      })

      it('Should not be able to log in with the old password', async function() {
        await createUserVerified(mail, frost)
        await mail.removeAll()
        await frost.sendEmailForgotPassword()
        const token = await getTokenResetPassword(mail)
        await frost.changePasswordWithToken(token, newPassword)
        await expect(frost.login(email, password)).to.be.throwWith(errorMessages.resourceNotExist)
      })
    })

    describe('When a user tries to change his password and the account is not verified', function() {
      it(`Should send error message with '${errorMessages.accountIsNotVerified}'`, async function() {
        await frost.create()
        await mail.removeAll()
        await frost.sendEmailForgotPassword()
        const token = await getTokenResetPassword(mail)
        await expect(frost.changePasswordWithToken(token, 'new-password')).to.be.throwWith(
          errorMessages.accountIsNotVerified
        )
      })
    })
  })

  describe('When account does not exist', function() {
    it(`should return a message with '${errorMessages.resourceNotExist}'`, async function() {
      await expect(frost.sendEmailForgotPassword('email@exist.com')).to.be.throwWith(errorMessages.resourceNotExist)
    })
  })
})
