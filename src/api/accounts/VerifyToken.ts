import { errors } from '../../errors/errors'
import { AccountsController } from '../../modules/Accounts/Accounts.controller'
import { logger } from '../../utils/Logger/Logger'
import { Token } from '../Tokens'
import { getToken } from './utils/utils'

export const VerifyAccountToken = (verifiedAccount: boolean, pwnedCheckerRoot: string) => async (
  ctx: any,
  next: any,
): Promise<any> => {
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
    const usersController = new AccountsController(verifiedAccount, pwnedCheckerRoot)
    await usersController.update(user.id, user)
    const token = await getToken(user.email, Token.Login)
    ctx.body = { token }
  } catch (e) {
    logger.error('api.VerifyAccountToken', e)
    throw e
  }
}
