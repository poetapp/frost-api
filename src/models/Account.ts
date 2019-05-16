export interface Account {
  readonly id?: string
  readonly email: string
  readonly password: string
  readonly verified: boolean
  readonly privateKey: string
  readonly publicKey: string
  readonly createdAt: string
  readonly apiTokens?: Token[]
  readonly testApiTokens?: Token[]
  readonly issuer: string
  readonly name?: string
  readonly bio?: string
  readonly ethereumAddress?: string
  readonly poeAddress?: string
  readonly poeAddressMessage?: string
  readonly poeAddressSignature?: string
  readonly poeAddressVerified?: boolean
}

interface Token {
  readonly token: string
}
