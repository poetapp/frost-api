import * as Joi from 'joi'
import { template, subject } from '../../../emails/forgotPassword'
import { ControllerApi } from '../../../interfaces/ControllerApi'
import { Nodemailer } from '../../../modules/Nodemailer/Nodemailer'
import { getToken } from '../utils/utils'

export class ForgotPassword implements ControllerApi {
  async handler(ctx: any, next: any): Promise<any> {
    try {
      const { email } = ctx.request.body
      const token = await getToken(email)

      const data = {
        to: email,
        from: `"Po.et" <contact@po.et>`,
        subject,
        html: template(token)
      }

      await Nodemailer.sendMail(data)
      ctx.status = 200
    } catch (e) {
      throw e
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
