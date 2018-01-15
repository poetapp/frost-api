import * as Joi from 'joi'
import { errors } from '../../errors/errors'
import { AccountsController } from '../../modules/Accounts/Accounts.controller'
import { Argon2 } from '../../utils/Argon2/Argon2'
import { getToken } from './utils/utils'

import { ControllerApi } from '../../interfaces/ControllerApi'

export class Login implements ControllerApi {
  async handler(ctx: any, next: any) {
    try {
      const user = ctx.request.body
      const usersController = new AccountsController()
      const response = await usersController.get(user.email)
      const argon2 = new Argon2()

      await argon2.verify(user.password, response.password)

      const token = await getToken(user.email, ['login'])
      ctx.body = { token }
    } catch (e) {
      const { ResourceNotFound } = errors
      ctx.throw(ResourceNotFound.code, ResourceNotFound.message)
    }
  }

  validate() {
    return {
      email: Joi.string()
        .email()
        .required(),
      password: Joi.string().required()
    }
  }
}
