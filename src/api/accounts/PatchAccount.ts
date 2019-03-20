import * as Joi from 'joi'

import { AccountAlreadyExists, Unauthorized } from '../../errors/errors'
import { ValidateParams } from '../../middlewares/validate'
import { AccountsController } from '../../modules/Accounts/Accounts.controller'

export const PatchAccountSchema: ValidateParams = {
  params: () => ({
    issuer: Joi.string().required(),
  }),
  body: () => ({
    email: Joi.string().optional(),
    name: Joi.string().allow('').optional(),
    bio: Joi.string().allow('').optional(),
    ethereumAddress: Joi.string().allow('').optional(),
  }),
}

export const PatchAccount = () => async (ctx: any, next: any): Promise<any> => {
  const logger = ctx.logger(__dirname)
  const { issuer } = ctx.params
  const { user } = ctx.state

  logger.debug({ issuer, user }, 'PatchAccount')

  if (user.issuer !== issuer)
    throw new Unauthorized()

  const accountsController = new AccountsController(ctx.logger, false, null)

  if (ctx.request.body.email) {
    const existing = await accountsController.get(ctx.request.body.email)
    logger.trace(existing, 'Existing Account')

    if (existing)
      throw new AccountAlreadyExists()
  }

  const response = await accountsController.update(user.id, ctx.request.body)

  const { email, createdAt, name, bio, ethereumAddress } = response
  ctx.body = { email, createdAt, issuer, name, bio, ethereumAddress }
}
