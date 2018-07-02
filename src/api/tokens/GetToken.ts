import { AccountsController } from '../../modules/Accounts/Accounts.controller'
import { logger } from '../../utils/Logger/Logger'
import { Vault } from '../../utils/Vault/Vault'

export const GetToken = () => async (ctx: any, next: any): Promise<any> => {
  try {
    const { user } = ctx.state
    const { email } = user
    const accountsController = new AccountsController()
    const currentUser = await accountsController.get(email)
    const allTokens = currentUser.apiTokens.map(({ token }) => Vault.decrypt(token))
    const apiTokens = await Promise.all(allTokens)

    ctx.body = {
      apiTokens,
    }
  } catch (e) {
    logger.error('api.GetToken', e)
    ctx.status = 500
  }
}
