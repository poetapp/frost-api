import { AccountController } from '../../controllers/AccountController'

export const VerifyAccount = (accountController: AccountController) => async (ctx: any, next: any): Promise<any> => {
  const { user } = ctx.state
  const { id, email } = user
  await accountController.sendAccountVerificationEmail(id, email)
  ctx.status = 200
}
