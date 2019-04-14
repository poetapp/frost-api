import { errors } from '../../errors/errors'
import { AccountsController } from '../../modules/Accounts/Accounts.controller'
import { Token } from '../Tokens'
import { getToken } from './utils/utils'

export const VerifyAccountToken = (verifiedAccount: boolean, pwnedCheckerRoot: string) => async (
  ctx: any,
  next: any,
): Promise<any> => {
  const logger = ctx.logger(__dirname)
  const { EmailVerfied, InternalError } = errors

  try {
    const { user, tokenData } = ctx.state

    if (user.verified) {
      ctx.status = EmailVerfied.code
      ctx.body = EmailVerfied.message
      return
    }

    if (tokenData.data.meta.name !== Token.VerifyAccount.meta.name) {
      ctx.status = InternalError.code
      ctx.body = InternalError.message
      return
    }

    user.verified = true
    user.save()
    const token = await getToken(user.email, Token.Login)
    ctx.body = { token, issuer: user.issuer }
  } catch (exception) {
    logger.error({ exception }, 'api.VerifyAccountToken')
    throw exception
  }
}
