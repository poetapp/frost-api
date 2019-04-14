import { errors } from '../../errors/errors'
import { validatePassword } from '../../helpers/validatePassword'
import { AccountsController } from '../../modules/Accounts/Accounts.controller'
import { processPassword } from '../../utils/Password'
import { SendEmailTo } from '../../utils/SendEmail'
import { Vault } from '../../utils/Vault/Vault'
import { PasswordComplexConfiguration } from '../PasswordComplexConfiguration'
import { Token } from '../Tokens'
import { getToken, tokenMatch } from './utils/utils'

export const PasswordChangeTokenSchema = (
  passwordComplex: PasswordComplexConfiguration,
) => ({ password }: { password: string }) => ({
  password: validatePassword(password, passwordComplex),
})

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
    await user.save()
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
