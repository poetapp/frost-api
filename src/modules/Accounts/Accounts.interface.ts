import { Document } from 'mongoose'

interface Token {
  readonly token: string
}

export interface Accounts extends Document {
  readonly email: string
  readonly password: string
  readonly verified: boolean
  readonly privateKey: string
  readonly apiToken: string
  readonly createdAt: string
  readonly apiTokens: [Token]
}
