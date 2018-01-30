import { verify } from 'jsonwebtoken'
import { errors } from '../errors/errors'
import { AccountsController } from '../modules/Accounts/Accounts.controller'
import { Vault } from '../utils/Vault/Vault'

const { AuthenticationFailed } = errors

export const authorization = () => {
  return async (ctx: any, next: any) => {
    try {
      const secret = await Vault.readSecret('frost')
      const { jwt } = secret.data

      const token = ctx.header.token ? ctx.header.token : ctx.params.token
      const decoded = verify(token, jwt)
      const { client_token, email } = decoded as any

      const tokenData = await Vault.verifyToken(client_token)
      const usersController = new AccountsController()
      ctx.state.tokenData = tokenData
      ctx.state.user = await usersController.get(email)
      return ctx.state.user ? next() : (ctx.status = 404)
    } catch (e) {
      ctx.throw(AuthenticationFailed.code, AuthenticationFailed.message)
    }
  }
}
