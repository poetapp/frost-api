import * as Joi from 'joi'
const PasswordComplexity = require('joi-password-complexity')
import { errors } from '../../errors/errors'
import { SendEmail } from '../../utils/SendEmail/SendEmail'
import { getToken } from './utils/utils'

import { configuration } from '../../configuration'
import { ControllerApi } from '../../interfaces/ControllerApi'
import { AccountsController } from '../../modules/Accounts/Accounts.controller'

const { passwordComplex } = configuration

export class CreateAccount implements ControllerApi {
  async handler(ctx: any, next: any): Promise<any> {
    try {
      const user = ctx.request.body
      const usersController = new AccountsController()
      const response = await usersController.create(user)
      const { email } = response
      const sendEmail = new SendEmail(email)

      const token = await getToken(email)
      await sendEmail.sendVerified(token)

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
