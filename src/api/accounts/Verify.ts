import { Token } from '../../api/Tokens'
import { SendEmailTo } from '../../utils/SendEmail'

import { getToken } from './utils/utils'

export const VerifyAccount = (sendEmail: SendEmailTo) => async (ctx: any, next: any): Promise<any> => {
  const logger = ctx.logger(__dirname)

  try {
    const { user } = ctx.state
    const { email } = user
    const token = await getToken(email, Token.VerifyAccount)

    await sendEmail(email).sendVerified(token)
    ctx.status = 200
  } catch (exception) {
    logger.error({ exception }, 'api.VerifyAccount')
    throw exception
  }
}
