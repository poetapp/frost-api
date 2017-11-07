import { Document, model, Schema } from 'mongoose'

export interface IUser extends Document {
  email: string
  password: string
  verified: boolean
  privateKey: string
  createdAt: string
}

export const UserSchema = new Schema({
  email: {
    type: String,
    required: true
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
  createdAt: {
    type: String,
    required: true
  }
})

const User = model<IUser>('User', UserSchema)

export default User
