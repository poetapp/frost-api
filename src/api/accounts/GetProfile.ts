import { errors } from '../../errors/errors'
import { logger } from '../../utils/Logger/Logger'

export const GetProfile = () => async (ctx: any, next: any) => {
  try {
    const { user } = ctx.state
    const { createdAt, verified, email } = user
    ctx.body = { createdAt, verified, email }
  } catch (e) {
    const { InternalError } = errors
    logger.error('api.GetProfile', e)
    ctx.throw(InternalError.code, InternalError.message)
  }
}
