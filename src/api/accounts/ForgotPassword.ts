import { SendEmail } from 'SendEmail'
import { errors } from 'errors'
import * as Joi from 'joi'
import { ControllerApi } from '../../interfaces/ControllerApi'
import { usersController } from '../../modules/Users/User'
import { getToken } from './utils/utils'

export class ForgotPassword implements ControllerApi {
  async handler(ctx: any, next: any): Promise<any> {
    try {
      const { email } = ctx.request.body
      const user = await usersController.get(email)
      const { ResourceNotFound } = errors
      if (user) {
        const sendEmail = new SendEmail(email)
        const token = await getToken(email)
        await sendEmail.sendForgotPassword(token)
        ctx.status = 200
      } else {
        ctx.status = ResourceNotFound.code
        ctx.body = ResourceNotFound.message
      }
    } catch (e) {
      const { InternalError } = errors
      ctx.throw(InternalError.code, InternalError.message)
    }
  }

  validate() {
    return {
      email: Joi.string()
        .email()
        .required()
    }
  }
}