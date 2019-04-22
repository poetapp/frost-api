import * as Joi from 'joi'
import bytesToUuid = require('uuid/lib/bytesToUuid')

import { PasswordComplexConfiguration } from '../../api/PasswordComplexConfiguration'
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
  const usersController = new AccountsController(ctx.logger, verifiedAccount, pwnedCheckerRoot, sendEmail)
  const { email, password } = ctx.request.body
  const { account: { id, issuer }, token } = await usersController.create({ email, password })
  ctx.body = { id: id && bytesToUuid(id), issuer, token }
}
