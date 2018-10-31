import { Token } from '../../src/api/Tokens'
import { tokenMatch } from '../../src/api/accounts/utils/utils'
import { errors } from '../errors/errors'

const isApiKey = tokenMatch(Token.ApiKey)
const isTestApiKey = tokenMatch(Token.TestApiKey)
export const isRequiredToken = (tokenData: any) => isApiKey(tokenData.data) || isTestApiKey(tokenData.data)

export const requireApiToken = () => {
  return (ctx: any, next: any) => {
    const logger = ctx.logger(__dirname)

    try {
      const { InternalError } = errors
      const { tokenData } = ctx.state

      if (isRequiredToken(tokenData)) return next()
      else {
        ctx.status = InternalError.code
        ctx.body = InternalError.message
      }
    } catch (exception) {
      const { InternalError } = errors
      logger.error({ exception }, 'middleware.requireApiToken')
      ctx.throw(InternalError.code, InternalError.message)
    }
  }
}
