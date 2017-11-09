import { verify } from 'jsonwebtoken'
import { usersController } from '../../modules/Users/User'
import { Vault } from '../../modules/Vault/Vault'

export const authorization = (urls: string[]) => {
  return async (ctx: any, next: any) => {
    try {
      const secret = await Vault.readSecret('poet')
      const { jwt } = secret.data
      const url = ctx.url.replace('/', '')
      const notRequiredToken = urls.includes(url)

      if (notRequiredToken) return next()

      const { token } = ctx.request.body
      const decoded = verify(token, jwt)
      const { client_token, email } = decoded as any

      await Vault.verifyToken(client_token)
      ctx.state.user = await usersController.get(email)
      ctx.state.user ? await next() : (ctx.status = 404)
    } catch (e) {
      ctx.status = 401
    }
  }
}
