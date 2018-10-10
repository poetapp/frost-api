import { Token } from '../../api/Tokens'
import { logger } from '../../utils/Logger/Logger'
import { SendEmailTo } from '../../utils/SendEmail'

import { getToken } from './utils/utils'

export const VerifyAccount = (sendEmail: SendEmailTo) => async (ctx: any, next: any): Promise<any> => {
  try {
    const { user } = ctx.state
    const { email } = user
    const token = await getToken(email, Token.VerifyAccount)

    await sendEmail(email).sendVerified(token)
    ctx.status = 200
  } catch (e) {
    logger.error('api.VerifyAccount', e)
    throw e
  }
}
