import * as Joi from 'joi'
import { errors } from '../../errors/errors'
import { ControllerApi } from '../../interfaces/ControllerApi'
import { AccountsController } from '../../modules/Accounts/Accounts.controller'
import { Argon2 } from '../../utils/Argon2/Argon2'
import { logger } from '../../utils/Logger/Logger'
import { Token } from '../Tokens'
import { getToken } from './utils/utils'

export class Login implements ControllerApi {
  async handler(ctx: any, next: any) {
    try {
      const user = ctx.request.body
      const usersController = new AccountsController()
      const response = await usersController.get(user.email)
      const argon2 = new Argon2()

      await argon2.verify(user.password, response.password)

      const token = await getToken(user.email, Token.Login)
      ctx.body = { token }
    } catch (e) {
      const { ResourceNotFound } = errors
      logger.error('api.Login', e)
      ctx.throw(ResourceNotFound.code, ResourceNotFound.message)
    }
  }

  validate() {
    return {
      email: Joi.string()
        .email()
        .required(),
      password: Joi.string().required(),
    }
  }
}
