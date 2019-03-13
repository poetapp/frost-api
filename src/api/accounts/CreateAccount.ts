import * as Joi from 'joi'

import { PasswordComplexConfiguration } from '../../api/PasswordComplexConfiguration'
import { errors } from '../../errors/errors'
import { validatePassword } from '../../helpers/validatePassword'
import { AccountsController } from '../../modules/Accounts/Accounts.controller'
import { SendEmailTo } from '../../utils/SendEmail'

export const CreateAccountSchema = (
  passwordComplex: PasswordComplexConfiguration,
) => ({ password }: { password: string }) => ({
  email: Joi.string()
    .email()
    .required(),
  password: validatePassword(password, passwordComplex),
})

export const CreateAccount = (sendEmail: SendEmailTo, verifiedAccount: boolean, pwnedCheckerRoot: string) => async (
  ctx: any,
): Promise<any> => {
  const logger = ctx.logger(__dirname)

  try {
    const usersController = new AccountsController(ctx.logger, verifiedAccount, pwnedCheckerRoot, sendEmail)
    const { email, password } = ctx.request.body
    const token = await usersController.create({ email, password })
    ctx.body = { token }
  } catch (exception) {
    const { AccountAlreadyExists } = errors
    logger.error({ exception }, 'api.CreateAccount')
    ctx.throw(AccountAlreadyExists.code, AccountAlreadyExists.message)
  }
}
