import { errors } from '../../errors/errors'
import { ControllerApi } from '../../interfaces/ControllerApi'
import { AccountsController } from '../../modules/Accounts/Accounts.controller'
import { Vault } from '../../utils/Vault/Vault'
import { Token } from '../Tokens'

export class VerifyAccountToken implements ControllerApi {
  async handler(ctx: any, next: any): Promise<any> {
    try {
      const { user, tokenData } = ctx.state
      const { EmailVerfied, InternalError } = errors
      if (tokenData.data.meta.name === Token.VerifyAccount.meta.name) {
        if (user.verified) {
          ctx.status = EmailVerfied.code
          ctx.body = EmailVerfied.message
          return
        }

        user.verified = true
        const usersController = new AccountsController()
        await usersController.update(user.id, user)
        await Vault.revokeToken(tokenData.data.id)
        return (ctx.body = 'Email verified')
      }
      ctx.status = InternalError.code
      ctx.body = InternalError.message
    } catch (e) {
      throw e
    }
  }

  validate(): object {
    return {}
  }
}
