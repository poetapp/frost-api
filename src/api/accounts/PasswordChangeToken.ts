import { AccountController } from '../../controllers/AccountController'
import { validatePassword } from '../../helpers/validatePassword'
import { PasswordComplexityConfiguration } from '../PasswordComplexityConfiguration'

export const PasswordChangeTokenSchema = (
  passwordComplex: PasswordComplexityConfiguration,
) => ({ password }: { password: string }) => ({
  password: validatePassword(password, passwordComplex),
})

export const PasswordChangeToken = (
  accountController: AccountController,
) => async (ctx: any, next: any): Promise<any> => {
  const { user: { id, email }, tokenData } = ctx.state
  const { password } = ctx.request.body

  const token = await accountController.changePasswordWithToken(tokenData.data, id, email, password)

  ctx.body = { token }
  ctx.status = 200
}
