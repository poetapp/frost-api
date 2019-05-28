import { AccountController } from '../controllers/AccountController'

export const extractToken = (ctx: any): string => (ctx.header.token ? ctx.header.token : ctx.params.token) || ''

export const Authorization = (accountController: AccountController) => async (ctx: any, next: any) => {
  // TODO: add configuration to ctx in app.ts so middlewares have access.
  // This is needed until we can figure out how to restart vault between
  // individual tests.
  // Currently a hack used to prevent errors in integration tests.
  if (process.env.SKIP_VAULT === 'true') return (ctx.status = 404)

  const token = extractToken(ctx)

  const { account, tokenData, jwt } = await accountController.authorizeRequest(token)

  if (!account) return (ctx.status = 404)

  ctx.state.tokenData = tokenData
  ctx.state.user = account
  ctx.state.jwtSecret = jwt

  return next()
}
