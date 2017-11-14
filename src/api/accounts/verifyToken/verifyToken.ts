import { usersController } from '../../../modules/Users/User'

import { ControllerApi } from '../../../interfaces/ControllerApi'

export class VerifyAccountToken implements ControllerApi {
  async handler(ctx: any, next: any): Promise<any> {
    try {
      const { user } = ctx.state

      if (user.verified) return (ctx.body = 'Email already verified')

      user.verified = true

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
