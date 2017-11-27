import { Nodemailer } from 'Nodemailer'
import * as Joi from 'joi'
import { template, subject } from '../../emails/verify'
import { getToken } from './utils/utils'

import { ControllerApi } from '../../interfaces/ControllerApi'

export class VerifyAccount implements ControllerApi {
  async handler(ctx: any, next: any): Promise<any> {
    try {
      const { email } = ctx.request.body
      const token = await getToken(email)

      const data = {
        to: email,
        from: `"Po.et" <contact@po.et>`,
        subject,
        html: template(`http://localhost:3000/account/verify/${token}`)
      }

      await Nodemailer.sendMail(data)
      ctx.status = 200
    } catch (e) {
      throw e
    }
  }

  validate(): object {
    return {
      email: Joi.string()
        .email()
        .required()
    }
  }
}
