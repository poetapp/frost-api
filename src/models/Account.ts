export interface Account {
  readonly id?: string
  readonly email: string
  readonly password: string
  readonly verified: boolean
  readonly privateKey: string
  readonly publicKey: string
  readonly createdAt: string
  readonly apiTokens: [Token]
  readonly testApiTokens: [Token]
  readonly issuer: string
  readonly name: string
  readonly bio: string
  readonly ethereumAddress: string
}

interface Token {
  readonly token: string
}
