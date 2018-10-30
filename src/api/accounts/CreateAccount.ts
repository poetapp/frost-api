import * as Joi from 'joi'
const PasswordComplexity = require('joi-password-complexity')

import { PasswordComplexConfiguration } from 'api/PasswordComplexConfiguration'
import { errors } from '../../errors/errors'
import { Network } from '../../interfaces/Network'
import { AccountsController } from '../../modules/Accounts/Accounts.controller'
import { logger } from '../../utils/Logger/Logger'
import { SendEmailTo } from '../../utils/SendEmail'
import { Vault } from '../../utils/Vault/Vault'

import { Token } from '../Tokens'
import { getToken } from './utils/utils'

export const CreateAccountSchema = (
  passwordComplex: PasswordComplexConfiguration,
  verifiedAccount: boolean,
  pwnedCheckerRoot: string,
) => (values: { password: string }): object => {
  const { password } = values
  const usersController = new AccountsController(verifiedAccount, pwnedCheckerRoot)

  return {
    email: Joi.string()
      .email()
      .required(),
    password: Joi.validate(password, new PasswordComplexity(passwordComplex), (err, value) => {
      if (err) throw usersController.getTextErrorPassword(passwordComplex)

      return value
    }),
  }
}

export const CreateAccount = (sendEmail: SendEmailTo, verifiedAccount: boolean, pwnedCheckerRoot: string) => async (
  ctx: any,
  next: any,
): Promise<any> => {
  try {
    const user = ctx.request.body
    const { email } = user
    const apiToken = await getToken(email, Token.TestApiKey, Network.TEST)
    user.testApiTokens = [{ token: await Vault.encrypt(`TEST_${apiToken}`) }]
    const usersController = new AccountsController(verifiedAccount, pwnedCheckerRoot)

    await usersController.create(user)

    const tokenVerifiedAccount = await getToken(email, Token.VerifyAccount)
    await sendEmail(email).sendVerified(tokenVerifiedAccount)
    const token = await getToken(email, Token.Login)
    ctx.body = { token }
  } catch (e) {
    const { AccountAlreadyExists } = errors
    logger.error('api.CreateAccount', e)
    ctx.throw(AccountAlreadyExists.code, AccountAlreadyExists.message)
  }
}
