import { errors } from '../errors/errors'
import { logger } from '../utils/Logger/Logger'

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
      logger.error('middleware.requireEmailVerified', e)
      ctx.throw(InternalError.code, InternalError.message)
    }
  }
}
