import { sign } from 'jsonwebtoken'
import { isNil, path } from 'ramda'

import { TokenOptions } from '../api/Tokens'
import { Network } from '../interfaces/Network'
import { Vault } from '../utils/Vault/Vault'

const createJwtToken = (data: object, secret: string) => sign(data, secret)

export const getToken = async (email: string, options: TokenOptions, network?: Network) => {
  const secret = await Vault.readSecret('frost')
  const { jwt } = secret.data
  const tokenVault = await Vault.createToken(options)
  const { client_token } = tokenVault.auth

  return createJwtToken({ email, client_token, network }, jwt)
}

export const tokenMatch = (expected: any) => (actual: any) => {
  const expectedVal = path(['meta', 'name'], expected)
  const actualVal = path(['meta', 'name'], actual)

  return isNil(expectedVal) || isNil(actualVal) ? false : expectedVal === actualVal
}

export const isLiveNetwork = (network: string) => network === Network.LIVE
