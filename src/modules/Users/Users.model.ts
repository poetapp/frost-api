import { Document, model, Schema } from 'mongoose'
import { validate } from './User.hooks'

export interface User extends Document {
  email: string
  password: string
  verified: boolean
  privateKey: string
  createdAt: string
}

export const UserSchema = new Schema({
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
  }
})

UserSchema.pre('validate', validate)

export const UserModel = model<User>('User', UserSchema)
