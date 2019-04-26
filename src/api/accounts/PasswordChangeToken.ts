import { AccountController } from '../../controllers/AccountController'
import { validatePassword } from '../../helpers/validatePassword'
import { PasswordComplexConfiguration } from '../PasswordComplexConfiguration'

export const PasswordChangeTokenSchema = (
  passwordComplex: PasswordComplexConfiguration,
) => ({ password }: { password: string }) => ({
  password: validatePassword(password, passwordComplex),
})

export const PasswordChangeToken = (
  accountController: AccountController,
) => async (ctx: any, next: any): Promise<any> => {
  const logger = ctx.logger(__dirname)

  const { user: { issuer, email }, tokenData } = ctx.state
  const { password } = ctx.request.body

  const token = await accountController.changePasswordWithToken(tokenData.data, issuer, email, password)

  ctx.body = { token }
  ctx.status = 200
}
