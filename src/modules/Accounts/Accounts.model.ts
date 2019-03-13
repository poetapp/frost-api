import { model, Schema, Document } from 'mongoose'

interface Token {
  readonly token: string
}

export interface Account extends Document {
  readonly email: string
  readonly password: string
  readonly verified: boolean
  readonly privateKey: string
  readonly publicKey: string
  readonly createdAt: string
  readonly apiTokens: [Token]
  readonly testApiTokens: [Token]
}

const TokenSchema = new Schema(
  {
    token: String,
  },
  { _id: false },
)

const AccountSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  verified: {
    type: Boolean,
    required: true,
  },
  privateKey: {
    type: String,
    required: true,
  },
  publicKey: {
    type: String,
    required: true,
  },
  createdAt: {
    type: String,
    required: true,
  },
  apiToken: {
    type: String,
  },
  apiTokens: [TokenSchema],
  testApiTokens: [TokenSchema],
})

export const Account = model<Account>('Accounts', AccountSchema)
