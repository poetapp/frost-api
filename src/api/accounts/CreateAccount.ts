import * as Joi from 'joi'

import { PasswordComplexConfiguration } from '../../api/PasswordComplexConfiguration'
import { errors } from '../../errors/errors'
import { validatePassword } from '../../helpers/validatePassword'
import { Network } from '../../interfaces/Network'
import { AccountsController } from '../../modules/Accounts/Accounts.controller'
import { SendEmailTo } from '../../utils/SendEmail'
import { Vault } from '../../utils/Vault/Vault'

import { Token } from '../Tokens'
import { getToken } from './utils/utils'

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
  next: any,
): Promise<any> => {
  const logger = ctx.logger(__dirname)

  try {
    const user = ctx.request.body
    const { email } = user
    const apiToken = await getToken(email, Token.TestApiKey, Network.TEST)
    user.testApiTokens = [{ token: await Vault.encrypt(`TEST_${apiToken}`) }]
    const usersController = new AccountsController(ctx.logger, verifiedAccount, pwnedCheckerRoot)

    await usersController.create(user)

    const tokenVerifiedAccount = await getToken(email, Token.VerifyAccount)
    await sendEmail(email).sendVerified(tokenVerifiedAccount)
    const token = await getToken(email, Token.Login)
    ctx.body = { token }
  } catch (exception) {
    const { AccountAlreadyExists } = errors
    logger.error({ exception }, 'api.CreateAccount')
    ctx.throw(AccountAlreadyExists.code, AccountAlreadyExists.message)
  }
}
