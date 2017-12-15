import * as Joi from 'joi'
import { template, subject } from '../../emails/verify'
import { Nodemailer } from '../../utils/Nodemailer/Nodemailer'
import { getToken } from './utils/utils'

import { configuration } from '../../configuration'
import { ControllerApi } from '../../interfaces/ControllerApi'
import { Path } from '../Path'

export class VerifyAccount implements ControllerApi {
  async handler(ctx: any, next: any): Promise<any> {
    try {
      const { email } = ctx.request.body
      const token = await getToken(email)
      const { ACCOUNTS_VERIFY } = Path
      const { frostUrl } = configuration

      const data = {
        to: email,
        from: `"Po.et" <contact@po.et>`,
        subject,
        html: template(`${frostUrl}${ACCOUNTS_VERIFY}/${token}`)
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
