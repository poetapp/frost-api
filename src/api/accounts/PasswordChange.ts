import * as Joi from 'joi'
const PasswordComplexity = require('joi-password-complexity')

import { errors } from '../../errors/errors'
import { AccountsController } from '../../modules/Accounts/Accounts.controller'
import { logger } from '../../utils/Logger/Logger'
import { processPassword, verify } from '../../utils/Password'
import { PasswordComplexConfiguration } from '../PasswordComplexConfiguration'
import { Token } from '../Tokens'

export const PasswordChangeSchema = (
  passwordComplex: PasswordComplexConfiguration,
  verifiedAccount: boolean,
  pwnedCheckerRoot: string
) => (values: { password: string; oldPassword: string }) => {
  const { password, oldPassword } = values
  const usersController = new AccountsController(verifiedAccount, pwnedCheckerRoot)

  return {
    password: Joi.validate(password, new PasswordComplexity(passwordComplex), (err, value) => {
      if (err) throw usersController.getTextErrorPassword(passwordComplex)

      return value
    }),
    oldPassword: Joi.validate(oldPassword, new PasswordComplexity(passwordComplex), (err, value) => {
      if (err) throw usersController.getTextErrorPassword(passwordComplex)

      return value
    }),
  }
}

export const PasswordChange = (verifiedAccount: boolean, pwnedCheckerRoot: string) => async (
  ctx: any,
  next: any
): Promise<any> => {
  const { InvalidInput, InternalError } = errors
  try {
    const { user, tokenData } = ctx.state

    if (tokenData.data.meta.name !== Token.Login.meta.name) {
      ctx.status = InternalError.code
      ctx.body = InternalError.message
      return
    }

    const { password, oldPassword } = ctx.request.body

    await verify(oldPassword, user.password)
    user.password = await processPassword(password, pwnedCheckerRoot)
    const usersController = new AccountsController(verifiedAccount, pwnedCheckerRoot)
    await usersController.update(user.id, user)

    ctx.status = 200
  } catch (e) {
    logger.error('api.PasswordChange', e)
    ctx.throw(InvalidInput.code, InvalidInput.message + ' ' + e.message)
  }
}
