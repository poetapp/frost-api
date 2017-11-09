import { verify } from 'jsonwebtoken'
import { logger } from '../../modules/Logger/Logger'
import { usersController } from '../../modules/Users/User'
import { Vault } from '../../modules/Vault/Vault'

const SECRET = 'poet'

export const createWork = async (ctx: any, next: any) => {
  try {
    const { token } = ctx.request.body
    const decoded = verify(token, SECRET)
    const { client_token, email } = decoded as any
    const result = await Vault.verifyToken(client_token)
    const user = await usersController.get(email)
    logger.log('info', `privateKey encypted: ${user.privateKey}`)
    const privateKey = await Vault.decrypt(user.privateKey)
    logger.log('info', `privateKey encypted: ${privateKey}`)
    ctx.body = {}
  } catch (e) {
    ctx.status = 500
  }
}
