import { sign } from 'jsonwebtoken'
import { Vault } from '../../../utils/Vault/Vault'
import { TokenOptions } from '../../Tokens'

const createJwtToken = (data: object, secret: string, expiresIn: number) => {
  return sign(data, secret, { expiresIn })
}

export const getToken = async (email: string, options: TokenOptions) => {
  const secret = await Vault.readSecret('frost')
  const { jwt } = secret.data
  const tokenVault = await Vault.createToken(options)
  const { client_token, lease_duration } = tokenVault.auth
  return createJwtToken({ email, client_token }, jwt, lease_duration)
}
