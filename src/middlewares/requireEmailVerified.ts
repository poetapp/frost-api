import { errors } from '../errors/errors'

export const requireEmailVerified = () => {
  return (ctx: any, next: any) => {
    const logger = ctx.logger(__dirname)

    try {
      const { AccountNotVerify } = errors
      const { user } = ctx.state

      if (user.verified) return next()
      else {
        ctx.status = AccountNotVerify.code
        ctx.body = AccountNotVerify.message
      }
    } catch (exception) {
      const { InternalError } = errors
      logger.error({ exception }, 'middleware.requireEmailVerified')
      ctx.throw(InternalError.code, InternalError.message)
    }
  }
}
