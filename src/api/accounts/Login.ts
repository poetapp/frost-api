import * as Joi from 'joi'
import { errors } from '../../errors/errors'
import { AccountsController } from '../../modules/Accounts/Accounts.controller'
import { logger } from '../../utils/Logger/Logger'
import { verify } from '../../utils/Password'
import { Token } from '../Tokens'
import { getToken } from './utils/utils'

export const LoginSchema = () => ({
  email: Joi.string()
    .email()
    .required(),
  password: Joi.string().required(),
})

export const Login = (verifiedAccount: boolean, pwnedCheckerRoot: string) => async (ctx: any, next: any) => {
  try {
    const user = ctx.request.body
    const usersController = new AccountsController(verifiedAccount, pwnedCheckerRoot)
    const response = await usersController.get(user.email)
    await verify(user.password, response.password)
    const token = await getToken(user.email, Token.Login)
    ctx.body = { token }
  } catch (e) {
    const { ResourceNotFound } = errors
    logger.error('api.Login', e)
    ctx.throw(ResourceNotFound.code, ResourceNotFound.message)
  }
}
