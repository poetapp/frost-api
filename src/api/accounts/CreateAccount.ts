import * as Joi from 'joi'

import { PasswordComplexConfiguration } from '../../api/PasswordComplexConfiguration'
import { AccountController } from '../../controllers/AccountController'
import { validatePassword } from '../../helpers/validatePassword'

export const CreateAccountSchema = (
  passwordComplex: PasswordComplexConfiguration,
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
