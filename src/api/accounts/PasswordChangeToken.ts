import * as Joi from 'joi'
const PasswordComplexity = require('joi-password-complexity')

import { errors } from '../../errors/errors'
import { AccountsController } from '../../modules/Accounts/Accounts.controller'
import { processPassword } from '../../utils/Password'
import { SendEmailTo } from '../../utils/SendEmail'
import { Vault } from '../../utils/Vault/Vault'
import { PasswordComplexConfiguration } from '../PasswordComplexConfiguration'
import { Token } from '../Tokens'
import { getToken, tokenMatch } from './utils/utils'

export const PasswordChangeTokenSchema = (
  passwordComplex: PasswordComplexConfiguration,
  verifiedAccount: boolean,
  pwnedCheckerRoot: string,
) => (values: { password: string }, ctx: any) => {
  const { password } = values
  const usersController = new AccountsController(ctx.logger, verifiedAccount, pwnedCheckerRoot)

  return {
    password: Joi.validate(password, new PasswordComplexity(passwordComplex), (err: Joi.Err, value: string) => {
      if (err) throw usersController.getTextErrorPassword(passwordComplex)

      return value
    }),
  }
}

const hasForgotPasswordToken = tokenMatch(Token.ForgotPassword)

export const PasswordChangeToken = (
  sendEmail: SendEmailTo,
  verifiedAccount: boolean,
  pwnedCheckerRoot: string,
) => async (ctx: any, next: any): Promise<any> => {
  const logger = ctx.logger(__dirname)
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
    const usersController = new AccountsController(ctx.logger, verifiedAccount, pwnedCheckerRoot)
    await usersController.update(user.id, user)
    await Vault.revokeToken(tokenData.data.id)

    const token = await getToken(user.email, Token.Login)
    await sendEmail(user.email).changePassword()
    ctx.body = { token }
    ctx.status = 200
  } catch (exception) {
    logger.error({ exception }, 'api.PasswordChangeToken')
    ctx.throw(InvalidInput.code, InvalidInput.message + ' ' + exception.message)
  }
}
