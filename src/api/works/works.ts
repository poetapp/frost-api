import { logger } from '../../modules/Logger/Logger'
import { Vault } from '../../modules/Vault/Vault'

export const createWork = async (ctx: any, next: any) => {
  try {
    const { user } = ctx.state
    logger.log('info', `privateKey encypted: ${user.privateKey}`)
    const privateKey = await Vault.decrypt(user.privateKey)
    logger.log('info', `privateKey encypted: ${privateKey}`)
    ctx.status = 200
  } catch (e) {
    ctx.status = 500
  }
}
