import { errors } from '../../errors/errors'
import { ControllerApi } from '../../interfaces/ControllerApi'
import { AccountsController } from '../../modules/Accounts/Accounts.controller'

export class VerifyAccountToken implements ControllerApi {
  async handler(ctx: any, next: any): Promise<any> {
    try {
      const { user } = ctx.state
      const { EmailVerfied } = errors

      if (user.verified) {
        ctx.status = EmailVerfied.code
        ctx.body = EmailVerfied.message
        return
      }

      user.verified = true
      const usersController = new AccountsController()
      await usersController.update(user.id, user)

      return (ctx.body = 'Email verified')
    } catch (e) {
      throw e
    }
  }

  validate(): object {
    return {}
  }
}
