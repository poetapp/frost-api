import { Document } from 'mongoose'

export interface Accounts extends Document {
  readonly email: string
  readonly password: string
  readonly verified: boolean
  readonly privateKey: string
  readonly createdAt: string
}
