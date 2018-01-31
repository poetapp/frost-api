import * as Joi from 'joi'
const PasswordComplexity = require('joi-password-complexity')
import { configuration } from '../../configuration'
import { errors } from '../../errors/errors'
import { ControllerApi } from '../../interfaces/ControllerApi'
import { AccountsController } from '../../modules/Accounts/Accounts.controller'
import { Argon2 } from '../../utils/Argon2/Argon2'
import { Vault } from '../../utils/Vault/Vault'
import { Token } from '../Tokens'

const { passwordComplex } = configuration

export class PasswordChangeToken implements ControllerApi {
  async handler(ctx: any, next: any): Promise<any> {
    const { InvalidInput, InternalError } = errors
    try {
      const { user, tokenData } = ctx.state

      if (tokenData.data.meta.name !== Token.ForgotPassword.meta.name) {
        ctx.status = InternalError.code
        ctx.body = InternalError.message
        return
      }

      const { password } = ctx.request.body
      const argon2 = new Argon2(password)

      user.password = await argon2.hash()
      const usersController = new AccountsController()
      await usersController.update(user.id, user)
      await Vault.revokeToken(tokenData.data.id)
      ctx.status = 200
    } catch (e) {
      ctx.throw(InvalidInput.code, InvalidInput.message + ' ' + e.message)
    }
  }

  validate(values: any): object {
    const { password } = values
    const usersController = new AccountsController()

    return {
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
