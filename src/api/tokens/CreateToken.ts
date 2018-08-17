import { lte } from 'ramda'

import { configuration } from '../../configuration'
import { errors } from '../../errors/errors'
import { logger } from '../../utils/Logger/Logger'
import { Vault } from '../../utils/Vault/Vault'
import { Token } from '../Tokens'
import { getToken } from '../accounts/utils/utils'

const tooManyApiTokens = lte(configuration.maxApiTokens)

export const CreateToken = () => async (ctx: any, next: any): Promise<any> => {
  const { MaximumApiTokensLimitReached } = errors
  try {
    const { user } = ctx.state

    if (tooManyApiTokens(user.apiTokens.length)) {
      ctx.status = MaximumApiTokensLimitReached.code
      ctx.body = MaximumApiTokensLimitReached.message
      return
    }

    const { email } = user
    const apiToken = await getToken(email, Token.ApiKey)
    const apiTokenEncrypted = await Vault.encrypt(apiToken)
    user.apiTokens.push({ token: apiTokenEncrypted })
    user.save()

    ctx.body = {
      apiToken,
    }
  } catch (e) {
    logger.error('api.CreateToken', e)
    ctx.status = 500
  }
}
