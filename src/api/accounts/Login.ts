import * as Joi from 'joi'
import { isNil } from 'ramda'

import { errors } from '../../errors/errors'
import { AccountsController } from '../../modules/Accounts/Accounts.controller'
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
  const logger = ctx.logger(__dirname)
  const { ResourceNotFound } = errors

  try {
    const user = ctx.request.body
    const usersController = new AccountsController(ctx.logger, verifiedAccount, pwnedCheckerRoot)
    const response = await usersController.get(user.email)

    if (isNil(response)) {
      ctx.status = ResourceNotFound.code
      ctx.body = ResourceNotFound.message
    } else {
      await verify(user.password, response.password)
      const token = await getToken(user.email, Token.Login)
      ctx.body = { token, issuer: response.issuer }
    }
  } catch (exception) {
    logger.error({ exception }, 'api.Login')
    ctx.throw(ResourceNotFound.code, ResourceNotFound.message)
  }
}
