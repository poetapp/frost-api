import { ControllerApi } from '../../interfaces/ControllerApi'
import { AccountsController } from '../../modules/Accounts/Accounts.controller'
import { Vault } from '../../utils/Vault/Vault'

export class GetToken implements ControllerApi {
  async handler(ctx: any, next: any): Promise<any> {
    try {
      const { user } = ctx.state
      const { email } = user
      const accountsController = new AccountsController()
      const currentUser = await accountsController.get(email)
      const apiToken = await Vault.decrypt(currentUser.apiToken)
      ctx.body = {
        apiToken,
        dateCreated: currentUser.createdAt
      }
    } catch (e) {
      ctx.status = 500
    }
  }

  validate() {
    return {}
  }
}
