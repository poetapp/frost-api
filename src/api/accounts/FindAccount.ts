import * as Joi from 'joi'

import { AccountController } from '../../controllers/AccountController'
import { AccountNotFound } from '../../errors/errors'
import { ValidateParams } from '../../middlewares/validate'

export const FindAccountSchema: ValidateParams = {
  query: () => ({
    issuer: Joi.string().optional(),
  }),
}

export const FindAccount = (
  accountController: AccountController,
) => async (ctx: any, next: any): Promise<any> => {
  const logger = ctx.logger(__dirname)
  const { issuer } = ctx.query

  logger.info({ issuer }, 'FindAccount')

  const response = await accountController.findByIssuer(issuer)

  if (!response)
    throw new AccountNotFound()

  const { id, email, createdAt, name, bio, ethereumAddress } = response
  ctx.body = { id, email, createdAt, name, bio, ethereumAddress }
}
