import * as Joi from 'joi'
import { ControllerApi } from '../../../interfaces/ControllerApi'
import { Argon2 } from '../../../modules/Argon2/Argon2'
import { usersController } from '../../../modules/Users/User'
import { errors } from '../../errors/errors'

export class ChangePassword implements ControllerApi {
  async handler(ctx: any, next: any): Promise<any> {
    try {
      const { user } = ctx.state
      const { password } = ctx.request.body
      const argon2 = new Argon2(password)

      user.password = await argon2.hash()

      await usersController.update(user.id, user)

      ctx.status = 200
    } catch (e) {
      const { InvalidInput } = errors
      ctx.throw(InvalidInput.code, InvalidInput.message + ' ' + e.message)
    }
  }

  validate(): object {
    return {
      password: Joi.string()
        .min(6)
        .required(),
      token: Joi.string().required()
    }
  }
}
