import * as Joi from 'joi'

import { AccountController } from '../../controllers/AccountController'
import { validatePassword } from '../../helpers/validatePassword'
import { PasswordComplexityConfiguration } from '../PasswordComplexityConfiguration'

export const CreateAccountSchema = (
  passwordComplex: PasswordComplexityConfiguration,
) => ({ password }: { password: string }) => ({
  email: Joi.string()
    .email()
    .required(),
  password: validatePassword(password, passwordComplex),
})

export const CreateAccount = (accountController: AccountController) => async (
  ctx: any,
): Promise<any> => {
  const { email, password } = ctx.request.body
  const { id, issuer, token } = await accountController.create({ email, password })
  ctx.body = { id, issuer, token }
}
