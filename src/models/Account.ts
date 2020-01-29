export interface Account {
  readonly id?: string
  readonly email: string
  readonly emailPublic: boolean
  readonly password: string
  readonly verified: boolean
  readonly privateKey: string
  readonly publicKey: string
  readonly createdAt: string
  readonly apiTokens?: ReadonlyArray<Token>
  readonly testApiTokens?: ReadonlyArray<Token>
  readonly issuer: string
  readonly name?: string
  readonly bio?: string
  readonly ethereumAddress?: string
  readonly poeAddress?: string
  readonly poeAddressMessage?: string
  readonly poeAddressSignature?: string
  readonly poeAddressVerified?: boolean
  readonly ethereumRegistryPrivateKey?: string
  readonly ethereumRegistryAddress?: string
}

interface Token {
  readonly token: string
}
