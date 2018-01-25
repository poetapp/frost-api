import { getToken } from './utils/utils'

import { ControllerApi } from '../../interfaces/ControllerApi'
import { SendEmail } from '../../utils/SendEmail/SendEmail'

export class VerifyAccount implements ControllerApi {
  async handler(ctx: any, next: any): Promise<any> {
    try {
      const { user } = ctx.state
      const { email } = user
      const token = await getToken(email, ['verified-account'])

      const sendEmail = new SendEmail(email)
      await sendEmail.sendVerified(token)
      ctx.status = 200
    } catch (e) {
      throw e
    }
  }

  validate(): object {
    return {}
  }
}
