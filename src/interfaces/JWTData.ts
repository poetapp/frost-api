import { Network } from './Network'

export interface JWTData {
  readonly iat?: number
  readonly client_token?: string
  readonly accountId: string
  readonly email?: string
  readonly network?: Network
  readonly accessType?: string
}

export const isJWTData = (a: any): a is JWTData =>
  typeof a === 'object'
    && typeof(a.client_token) === 'string'
    && (typeof(a.accountId) === 'string' || typeof(a.email) === 'string')
