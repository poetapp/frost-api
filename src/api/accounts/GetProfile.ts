import { errors } from '../../errors/errors'

export const GetProfile = () => async (ctx: any, next: any) => {
  const logger = ctx.logger(__dirname)

  try {
    const {
      user: { createdAt, verified, email },
    } = ctx.state
    ctx.body = { createdAt, verified, email }
  } catch (exception) {
    const { InternalError } = errors
    logger.error({ exception }, 'api.GetProfile')
    ctx.throw(InternalError.code, InternalError.message)
  }
}
