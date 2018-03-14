import { model, Schema } from 'mongoose'
import { validate } from './Accounts.hooks'
import { Accounts } from './Accounts.interface'

const Tokens = new Schema(
  {
    token: String
  },
  { _id: false }
)

export const AccountsSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  verified: {
    type: Boolean,
    required: true
  },
  privateKey: {
    type: String,
    required: true
  },
  publicKey: {
    type: String,
    required: true
  },
  createdAt: {
    type: String,
    required: true
  },
  apiToken: {
    type: String
  },
  apiTokens: [Tokens]
})

AccountsSchema.pre('validate', validate)

export const AccountsModel = model<Accounts>('Accounts', AccountsSchema)
