import * as Joi from 'joi'
const PasswordComplexity = require('joi-password-complexity')

import { errors } from '../../errors/errors'
import { AccountsController } from '../../modules/Accounts/Accounts.controller'
import { logger } from '../../utils/Logger/Logger'
import { processPassword } from '../../utils/Password'
import { Vault } from '../../utils/Vault/Vault'
import { PasswordComplexConfiguration } from '../PasswordComplexConfiguration'
import { Token } from '../Tokens'
import { getToken, tokenMatch } from './utils/utils'

export const PasswordChangeTokenSchema = (
  passwordComplex: PasswordComplexConfiguration,
  verifiedAccount: boolean,
  pwnedCheckerRoot: string
) => (values: { password: string }) => {
  const { password } = values
  const usersController = new AccountsController(verifiedAccount, pwnedCheckerRoot)

  return {
    password: Joi.validate(password, new PasswordComplexity(passwordComplex), (err, value) => {
      if (err) throw usersController.getTextErrorPassword(passwordComplex)

      return value
    }),
  }
}

const hasForgotPasswordToken = tokenMatch(Token.ForgotPassword)

export const PasswordChangeToken = (verifiedAccount: boolean, pwnedCheckerRoot: string) => async (
  ctx: any,
  next: any
): Promise<any> => {
  const { InvalidInput, InternalError } = errors
  try {
    const { user, tokenData } = ctx.state

    if (!hasForgotPasswordToken(tokenData.data)) {
      ctx.status = InternalError.code
      ctx.body = InternalError.message
      return
    }

    const { password } = ctx.request.body
    user.password = await processPassword(password, pwnedCheckerRoot)
    const usersController = new AccountsController(verifiedAccount, pwnedCheckerRoot)
    await usersController.update(user.id, user)
    await Vault.revokeToken(tokenData.data.id)

    const token = await getToken(user.email, Token.Login)
    ctx.body = { token }
    ctx.status = 200
  } catch (e) {
    logger.error('api.PasswordChangeToken', e)
    ctx.throw(InvalidInput.code, InvalidInput.message + ' ' + e.message)
  }
}
