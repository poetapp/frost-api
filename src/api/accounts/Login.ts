import * as Joi from 'joi'

import { AccountController } from '../../controllers/AccountController'

export const LoginSchema = () => ({
  email: Joi.string()
    .email()
    .required(),
  password: Joi.string().required(),
})

export const Login = (accountController: AccountController) => async (ctx: any, next: any) => {
  const credentials = ctx.request.body
  const { id, issuer, token } = await accountController.login(credentials)
  ctx.body = { id, issuer, token }
}
