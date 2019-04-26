import * as Joi from 'joi'

import { AccountController } from '../../controllers/AccountController'
import { AccountAlreadyExists, Unauthorized } from '../../errors/errors'
import { ValidateParams } from '../../middlewares/validate'

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

export const PatchAccount = (accountController: AccountController) => async (ctx: any, next: any): Promise<any> => {
  const logger = ctx.logger(__dirname)
  const { issuer } = ctx.params
  const { body } = ctx.request
  const { user } = ctx.state

  logger.debug({ issuer, user }, 'PatchAccount')

  if (user.issuer !== issuer)
    throw new Unauthorized()

  if (body.email && body.email !== user.email) {
    const existing = await accountController.findByEmail(body.email)
    logger.trace(existing, 'Existing Account')

    if (existing)
      throw new AccountAlreadyExists()
  }

  await accountController.updateByIssuer(issuer, body)

  const { email, createdAt, name, bio, ethereumAddress } = user

  ctx.body = { email, createdAt, issuer, name, bio, ethereumAddress, ...body }
}
