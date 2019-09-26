import { AccountController } from '../controllers/AccountController'

export const extractToken = (ctx: any): string => (ctx.header.token ? ctx.header.token : ctx.params.token) || ''

export const Authentication = (accountController: AccountController) => async (ctx: any, next: any) => {
  const token = extractToken(ctx)

  if (token) {
    const { account, tokenData, accessType } = await accountController.authorizeRequest(token)

    ctx.state.tokenData = tokenData
    ctx.state.user = ctx.state.account = account
    ctx.state.accessType = accessType
  }

  return next()
}
