import { AccountsController } from '../../modules/Accounts/Accounts.controller'
import { Vault } from '../../utils/Vault/Vault'

export const GetToken = (verifiedAccount: boolean, pwnedCheckerRoot: string) => async (
  ctx: any,
  next: any,
): Promise<any> => {
  const logger = ctx.logger(__dirname)

  try {
    const { user } = ctx.state
    const { email } = user
    const accountsController = new AccountsController(ctx.logger, verifiedAccount, pwnedCheckerRoot)
    const currentUser = await accountsController.get(email)
    const apiTokensPromise = currentUser.apiTokens.map(({ token }) => Vault.decrypt(token))
    const testApiTokensPromise = currentUser.testApiTokens.map(({ token }) => Vault.decrypt(token))
    const apiTokens = await Promise.all(apiTokensPromise)
    const testApiTokens = await Promise.all(testApiTokensPromise)
    ctx.body = {
      apiTokens: apiTokens.concat(testApiTokens),
    }
  } catch (exception) {
    logger.error({ exception }, 'api.GetToken')
    ctx.status = 500
  }
}
