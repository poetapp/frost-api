import * as Joi from 'joi'
import { template, subject } from '../../../emails/forgotPassword'
import { ControllerApi } from '../../../interfaces/ControllerApi'
import { Nodemailer } from '../../../modules/Nodemailer/Nodemailer'
import { usersController } from '../../../modules/Users/User'
import { errors } from '../../errors/errors'
import { getToken } from '../utils/utils'

export class ForgotPassword implements ControllerApi {
  async sendEmail(email: string) {
    const token = await getToken(email)

    const data = {
      to: email,
      from: `"Po.et" <contact@po.et>`,
      subject,
      html: template(token)
    }

    await Nodemailer.sendMail(data)
  }

  async handler(ctx: any, next: any): Promise<any> {
    try {
      const { email } = ctx.request.body
      const user = await usersController.get(email)
      const { ResourceNotFound } = errors
      if (user) {
        await this.sendEmail(email)
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
