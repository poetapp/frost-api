import * as Joi from 'joi'

import { AccountController } from '../../controllers/AccountController'
import { validatePassword } from '../../helpers/validatePassword'
import { PasswordComplexityConfiguration } from '../PasswordComplexityConfiguration'

export const PasswordChangeSchema = (
  passwordComplex: PasswordComplexityConfiguration,
) => ({ password }: { password: string }) => ({
  password: validatePassword(password, passwordComplex),
  oldPassword: Joi.string(),
})

export const PasswordChange = (accountController: AccountController) => async (
  ctx: any,
  next: any,
): Promise<any> => {
  const logger = ctx.logger(__dirname)

  const { user, tokenData } = ctx.state
  const { password, oldPassword } = ctx.request.body

  await accountController.changePassword(tokenData.data, user, password, oldPassword)

  ctx.status = 200
}
