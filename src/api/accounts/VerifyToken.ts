import { AccountController } from '../../controllers/AccountController'

export const VerifyAccountToken = (accountController: AccountController) => async (
  ctx: any,
  next: any,
): Promise<any> => {
  const { user, tokenData } = ctx.state
  const { id, issuer, token } = await accountController.verifyAccount(user, tokenData.data)
  ctx.body = { id, issuer, token }
}
