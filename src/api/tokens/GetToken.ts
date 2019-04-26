import { AccountController } from '../../controllers/AccountController'
import { Vault } from '../../utils/Vault/Vault'

export const GetToken = (accountController: AccountController) => async (
  ctx: any,
  next: any,
): Promise<any> => {
  const logger = ctx.logger(__dirname)

  const { user } = ctx.state
  const { email } = user
  const currentUser = await accountController.findByEmail(email)
  const apiTokensPromise = currentUser.apiTokens.map(({ token }) => Vault.decrypt(token))
  const testApiTokensPromise = currentUser.testApiTokens.map(({ token }) => Vault.decrypt(token))
  const apiTokens = await Promise.all(apiTokensPromise)
  const testApiTokens = await Promise.all(testApiTokensPromise)

  ctx.body = {
    apiTokens: apiTokens.concat(testApiTokens),
  }
}
