import * as Joi from 'joi'

import { IncorrectOldPassword, IncorrectToken } from '../../errors/errors'
import { validatePassword } from '../../helpers/validatePassword'
import { AccountsController } from '../../modules/Accounts/Accounts.controller'
import { processPassword, verify } from '../../utils/Password'
import { PasswordComplexConfiguration } from '../PasswordComplexConfiguration'
import { Token } from '../Tokens'

export const PasswordChangeSchema = (
  passwordComplex: PasswordComplexConfiguration,
) => ({ password }: { password: string }) => ({
  password: validatePassword(password, passwordComplex),
  oldPassword: Joi.string(),
})

export const PasswordChange = (verifiedAccount: boolean, pwnedCheckerRoot: string) => async (
  ctx: any,
  next: any,
): Promise<any> => {
  const logger = ctx.logger(__dirname)

  const { user, tokenData } = ctx.state

  if (tokenData.data.meta.name !== Token.Login.meta.name)
    throw new IncorrectToken(tokenData.data.meta.name, Token.Login.meta.name)

  const { password, oldPassword } = ctx.request.body

  try {
    await verify(oldPassword, user.password)
  } catch (error) {
    throw new IncorrectOldPassword()
  }

  user.password = await processPassword(password, pwnedCheckerRoot)
  const usersController = new AccountsController(ctx.logger, verifiedAccount, pwnedCheckerRoot)
  await usersController.update(user.id, user)

  ctx.status = 200
}
