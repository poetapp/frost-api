import * as Joi from 'joi'
const PasswordComplexity = require('joi-password-complexity')
import { errors } from '../../errors/errors'
import { SendEmail } from '../../utils/SendEmail/SendEmail'
import { Token } from '../tokens'
import { getToken } from './utils/utils'

import { configuration } from '../../configuration'
import { ControllerApi } from '../../interfaces/ControllerApi'
import { AccountsController } from '../../modules/Accounts/Accounts.controller'
import { Vault } from '../../utils/Vault/Vault'

const { passwordComplex } = configuration

export class CreateAccount implements ControllerApi {
  async handler(ctx: any, next: any): Promise<any> {
    try {
      const user = ctx.request.body
      const { email } = user
      const apiToken = await getToken(email, Token.ApiKey)
      user.apiToken = await Vault.encrypt(apiToken)
      const usersController = new AccountsController()

      await usersController.create(user)

      const sendEmail = new SendEmail(email)
      const tokenVerifiedAccount = await getToken(email, Token.VerifyAccount)
      await sendEmail.sendVerified(tokenVerifiedAccount)
      const token = await getToken(email, Token.Login)
      ctx.body = { token }
    } catch (e) {
      const { AccountAlreadyExists } = errors
      ctx.throw(AccountAlreadyExists.code, AccountAlreadyExists.message)
    }
  }

  validate(values: any): object {
    const { password } = values
    const usersController = new AccountsController()

    return {
      email: Joi.string()
        .email()
        .required(),
      password: Joi.validate(
        password,
        new PasswordComplexity(passwordComplex),
        (err, value) => {
          if (err) throw usersController.getTextErrorPassword(passwordComplex)

          return value
        }
      )
    }
  }
}
