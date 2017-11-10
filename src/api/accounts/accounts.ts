import * as Joi from 'joi'
import { sign } from 'jsonwebtoken'
import { Argon2 } from '../../modules/Argon2/Argon2'
import { Nodemailer } from '../../modules/Nodemailer/Nodemailer'
import { usersController } from '../../modules/Users/User'
import { Vault } from '../../modules/Vault/Vault'
import { errors } from '../errors/errors'

const createJwtToken = (data: object, secret: string, expiresIn: number) => {
  return sign(data, secret, { expiresIn })
}

const getToken = async (email: string) => {
  const secret = await Vault.readSecret('poet')
  const { jwt } = secret.data
  const tokenVault = await Vault.createToken({ policies: ['goldfish'] })
  const { client_token, lease_duration } = tokenVault.auth
  return createJwtToken({ email, client_token }, jwt, lease_duration)
}

export const createAccount = async (ctx: any, next: any) => {
  try {
    const user = ctx.request.body
    const response = await usersController.create(user)
    const { email } = response

    const token = await getToken(email)

    ctx.body = { token }
  } catch (e) {
    const { AccountAlreadyExists } = errors
    ctx.throw(AccountAlreadyExists.code, AccountAlreadyExists.message)
  }
}

export const loginAccount = async (ctx: any, next: any) => {
  try {
    const user = ctx.request.body
    const response = await usersController.get(user.email)
    const argon2 = new Argon2()

    await argon2.verify(user.password, response.password)

    const token = await getToken(user.email)
    ctx.body = { token }
  } catch (e) {
    const { ResourceNotFound } = errors
    ctx.throw(ResourceNotFound.code, ResourceNotFound.message)
  }
}

export const recoverAccount = async (ctx: any, next: any) => {
  try {
    const { email } = ctx.request.body
    const token = await getToken(email)

    const data = {
      to: 'walter.zalazar.mdp@gmail.com',
      from: 'walter@poet.com',
      subject: 'Password help has arrived!',
      text: 'text',
      html: token
    }

    Nodemailer.sendMail(data)
  } catch (e) {
    throw e
  }
}

export const validateAccount = async (ctx: any, next: any) => {
  const data = ctx.request.body
  const { InvalidInput } = errors

  const schema = {
    email: Joi.string()
      .email()
      .required(),
    password: Joi.string()
      .min(6)
      .required()
  }

  try {
    await Joi.validate(data, schema)
    return next()
  } catch (e) {
    ctx.throw(InvalidInput.code, InvalidInput.message + e.message)
  }
}

export const validateRecoverAccount = async (ctx: any, next: any) => {
  const data = ctx.request.body
  const { InvalidInput } = errors

  const schema = {
    email: Joi.string()
      .email()
      .required()
  }

  try {
    await Joi.validate(data, schema)
    return next()
  } catch (e) {
    ctx.throw(InvalidInput.code, InvalidInput.message + e.message)
  }
}
