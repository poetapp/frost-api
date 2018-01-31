import * as Joi from 'joi'
const PasswordComplexity = require('joi-password-complexity')
import { configuration } from '../../configuration'
import { errors } from '../../errors/errors'
import { ControllerApi } from '../../interfaces/ControllerApi'
import { AccountsController } from '../../modules/Accounts/Accounts.controller'
import { Argon2 } from '../../utils/Argon2/Argon2'
import { logger } from '../../utils/Logger/Logger'
import { Token } from '../Tokens'

const { passwordComplex } = configuration

export class PasswordChange implements ControllerApi {
  async handler(ctx: any, next: any): Promise<any> {
    const { InvalidInput, InternalError } = errors
    try {
      const { user, tokenData } = ctx.state

      if (tokenData.data.meta.name !== Token.Login.meta.name) {
        ctx.status = InternalError.code
        ctx.body = InternalError.message
        return
      }

      const { password, oldPassword } = ctx.request.body
      const argon2 = new Argon2()

      await argon2.verify(oldPassword, user.password)

      user.password = await argon2.hash(password)
      const usersController = new AccountsController()
      await usersController.update(user.id, user)

      ctx.status = 200
    } catch (e) {
      logger.error('api.PasswordChange', e)
      ctx.throw(InvalidInput.code, InvalidInput.message + ' ' + e.message)
    }
  }

  validate(values: any): object {
    const { password, oldPassword } = values
    const usersController = new AccountsController()

    return {
      password: Joi.validate(
        password,
        new PasswordComplexity(passwordComplex),
        (err, value) => {
          if (err) throw usersController.getTextErrorPassword(passwordComplex)

          return value
        }
      ),
      oldPassword: Joi.validate(
        oldPassword,
        new PasswordComplexity(passwordComplex),
        (err, value) => {
          if (err) throw usersController.getTextErrorPassword(passwordComplex)

          return value
        }
      )
    }
  }
}
