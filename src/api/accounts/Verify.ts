import { Token } from '../../api/Tokens'
import { SendEmailTo } from '../../utils/SendEmail'

import { getToken } from '../../helpers/token'

export const VerifyAccount = (sendEmail: SendEmailTo) => async (ctx: any, next: any): Promise<any> => {
  const { user } = ctx.state
  const { email } = user
  const token = await getToken(email, Token.VerifyAccount)

  await sendEmail(email).sendVerified(token)
  ctx.status = 200
}
