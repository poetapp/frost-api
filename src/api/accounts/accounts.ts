import { sign } from 'jsonwebtoken'
import { Argon2 } from '../../modules/Argon2/Argon2'
import { usersController } from '../../modules/Users/User'
import { Vault } from '../../modules/Vault/Vault'

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
    ctx.status = 500
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
    ctx.status = e.status
  }
}

export const recoverAccount = async (ctx: any, next: any) => {
  return {}
}
