import { AccountController } from '../../controllers/AccountController'

export const GetTokens = (accountController: AccountController) => async (
  ctx: any,
  next: any,
): Promise<void> => {
  const { user } = ctx.state

  const apiTokens = await accountController.getTokens(user)

  ctx.body = {
    apiTokens,
  }
}
