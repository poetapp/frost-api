import { sign } from 'jsonwebtoken'
import { isNil, path } from 'ramda'

import { Vault } from '../../../utils/Vault/Vault'
import { TokenOptions } from '../../Tokens'

const createJwtToken = (data: object, secret: string) => sign(data, secret)

export const getToken = async (email: string, options: TokenOptions) => {
  const secret = await Vault.readSecret('frost')
  const { jwt } = secret.data
  const tokenVault = await Vault.createToken(options)
  const { client_token } = tokenVault.auth

  return createJwtToken({ email, client_token }, jwt)
}

export const tokenMatch = (expected: any) => (actual: any) => {
  const expectedVal = path(['meta', 'name'], expected)
  const actualVal = path(['meta', 'name'], actual)

  return isNil(expectedVal) || isNil(actualVal) ? false : expectedVal === actualVal
}
