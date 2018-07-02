import * as Joi from 'joi'
const PasswordComplexity = require('joi-password-complexity')
import { configuration } from '../../configuration'
import { errors } from '../../errors/errors'
import { AccountsController } from '../../modules/Accounts/Accounts.controller'
import { Argon2 } from '../../utils/Argon2/Argon2'
import { logger } from '../../utils/Logger/Logger'
import { Vault } from '../../utils/Vault/Vault'
import { Token } from '../Tokens'
import { getToken } from './utils/utils'

const { passwordComplex } = configuration

export const PasswordChangeTokenSchema = (values: { password: string }) => {
  const { password } = values
  const usersController = new AccountsController()

  return {
    password: Joi.validate(password, new PasswordComplexity(passwordComplex), (err, value) => {
      if (err) throw usersController.getTextErrorPassword(passwordComplex)

      return value
    }),
  }
}

export const PasswordChangeToken = () => async (ctx: any, next: any): Promise<any> => {
  const { InvalidInput, InternalError } = errors
  try {
    const { user, tokenData } = ctx.state

    if (tokenData.data.meta.name !== Token.ForgotPassword.meta.name) {
      ctx.status = InternalError.code
      ctx.body = InternalError.message
      return
    }

    const { password } = ctx.request.body
    const argon2 = new Argon2(password)

    user.password = await argon2.hash()
    const usersController = new AccountsController()
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
