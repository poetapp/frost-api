import { AccountController } from '../../controllers/AccountController'
import { EmailAlreadyVerified, Unauthorized } from '../../errors/errors'
import { Token } from '../Tokens'
import { getToken } from './utils/utils'

export const VerifyAccountToken = (accountController: AccountController) => async (
  ctx: any,
  next: any,
): Promise<any> => {
  const logger = ctx.logger(__dirname)

  const { user, tokenData } = ctx.state

  if (user.verified)
    throw new EmailAlreadyVerified()

  if (tokenData.data.meta.name !== Token.VerifyAccount.meta.name) {
    logger.warn({ user, tokenData }, 'User tried to verify email with incorrect token type.')
    throw new Unauthorized()
  }

  await accountController.updateByIssuer(user.issuer, { verified: true })

  const token = await getToken(user.email, Token.Login)

  ctx.body = { token, issuer: user.issuer }
}
