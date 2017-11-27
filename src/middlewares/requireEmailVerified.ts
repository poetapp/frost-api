import { errors } from '../errors/errors'

export const requireEmailVerified = () => {
  return (ctx: any, next: any) => {
    try {
      const { AccountNotVerify } = errors
      const { user } = ctx.state
      if (user.verified) return next()
      else {
        ctx.status = AccountNotVerify.code
        ctx.body = AccountNotVerify.message
      }
    } catch (e) {
      const { InternalError } = errors
      ctx.throw(InternalError.code, InternalError.message)
    }
  }
}
