import * as Joi from 'joi'
import { Argon2 } from '../../../modules/Argon2/Argon2'
import { usersController } from '../../../modules/Users/User'
import { errors } from '../../errors/errors'
import { getToken } from '../utils/utils'

import { ControllerApi } from '../../../interfaces/ControllerApi'

export class Login implements ControllerApi {
  async handler(ctx: any, next: any) {
    try {
      const user = ctx.request.body
      const response = await usersController.get(user.email)
      const argon2 = new Argon2()

      await argon2.verify(user.password, response.password)

      const token = await getToken(user.email)
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
      password: Joi.string()
        .min(6)
        .required()
    }
  }
}
