import { Token } from '../../src/api/tokens'
import { errors } from '../errors/errors'

export const isLoggedIn = () => {
  return (ctx: any, next: any) => {
    const { BadTokenScope } = errors
    const { tokenData } = ctx.state
    if (tokenData.data.meta.name !== Token.Login.meta.name) {
      ctx.status = BadTokenScope.code
      ctx.body = BadTokenScope.message
      return
    }

    return next()
  }
}
