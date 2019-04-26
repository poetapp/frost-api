import * as Joi from 'joi'

import { AccountController } from '../../controllers/AccountController'

export const ForgotPasswordSchema = () => ({
  email: Joi.string()
    .email()
    .required(),
})

export const ForgotPassword = (accountController: AccountController) => async (
  ctx: any,
  next: any,
): Promise<any> => {
  const logger = ctx.logger(__dirname)

  const { email } = ctx.request.body

  await accountController.sendPasswordResetEmail(email)

  ctx.status = 200
}
