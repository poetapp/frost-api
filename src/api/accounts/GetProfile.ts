import { createIssuerFromPrivateKey } from '@po.et/poet-js'

import { errors } from '../../errors/errors'
import { Vault } from '../../utils/Vault/Vault'

export const GetProfile = () => async (ctx: any, next: any) => {
  const logger = ctx.logger(__dirname)

  try {
    const { user } = ctx.state
    const { createdAt, verified, email }  = user
    const privateKey = await Vault.decrypt(user.privateKey)
    const issuer = createIssuerFromPrivateKey(privateKey)
    ctx.body = { createdAt, verified, email, issuer }
  } catch (exception) {
    const { InternalError } = errors
    logger.error({ exception }, 'api.GetProfile')
    ctx.throw(InternalError.code, InternalError.message)
  }
}
