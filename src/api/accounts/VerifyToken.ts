import { errors } from '../../errors/errors'
import { ControllerApi } from '../../interfaces/ControllerApi'
import { AccountsController } from '../../modules/Accounts/Accounts.controller'
import { logger } from '../../utils/Logger/Logger'
import { Vault } from '../../utils/Vault/Vault'
import { Token } from '../Tokens'

export class VerifyAccountToken implements ControllerApi {
  async handler(ctx: any, next: any): Promise<any> {
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
      const usersController = new AccountsController()
      await usersController.update(user.id, user)
      await Vault.revokeToken(tokenData.data.id)
      return (ctx.body = 'Email verified')
    } catch (e) {
      logger.error('api.VerifyAccountToken', e)
      throw e
    }
  }

  validate(): object {
    return {}
  }
}
