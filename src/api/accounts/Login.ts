import * as Joi from 'joi'

import { AccountController } from '../../controllers/AccountController'
import { AccountNotFound } from '../../errors/errors'
import { passwordMatches } from '../../utils/Password/Password'
import { Token } from '../Tokens'

import { getToken } from './utils/utils'

export const LoginSchema = () => ({
  email: Joi.string()
    .email()
    .required(),
  password: Joi.string().required(),
})

export const Login = (accountController: AccountController) => async (ctx: any, next: any) => {
  const logger = ctx.logger('Login Route')

  const credentials = ctx.request.body
  const account = await accountController.findByEmail(credentials.email)

  if (!account) {
    logger.trace({ credentials }, 'Account not found')
    throw new AccountNotFound()
  }

  if (!await passwordMatches(credentials.password, account.password)) {
    logger.trace({ credentials }, 'Password does not match')
    throw new AccountNotFound()
  }

  const token = await getToken(credentials.email, Token.Login)

  ctx.body = { token, issuer: account.issuer }
}
