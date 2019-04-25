import * as Joi from 'joi'

import { AccountController } from '../../controllers/AccountController'
import { AccountNotFound } from '../../errors/errors'
import { ValidateParams } from '../../middlewares/validate'

export const GetAccountSchema: ValidateParams = {
  params: () => ({
    issuer: Joi.string().required(),
  }),
}

export const GetAccount = (accountController: AccountController) => async (ctx: any, next: any): Promise<any> => {
  const logger = ctx.logger(__dirname)
  const { issuer } = ctx.params

  logger.info({ issuer }, 'GetAccount')

  const response = await accountController.findByIssuer(issuer)

  if (!response)
    throw new AccountNotFound()

  const { id, email, createdAt, name, bio, ethereumAddress } = response
  ctx.body = { id, email, createdAt, name, bio, ethereumAddress }
}
