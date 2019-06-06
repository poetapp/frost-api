import * as Joi from 'joi'

import { AccountController } from '../../controllers/AccountController'

export const RemoveTokenSchema = () => ({
  tokenId: Joi.string().required(),
})

export const RemoveToken = (accountController: AccountController) => async (ctx: any, next: any): Promise<any> => {
  const { user } = ctx.state
  const { tokenId } = ctx.params

  await accountController.removeToken(user, tokenId)
  ctx.status = 200
}
