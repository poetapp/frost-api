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
  const { user } = ctx.state

  logger.info({ issuer }, 'FindAccount')

  const response = await accountController.findByIssuer(issuer)

  if (!response)
    throw new AccountNotFound()

  const {
    id, email, verified, emailPublic, createdAt, name, bio, ethereumAddress, poeAddress, poeAddressVerified,
  } = response

  const isAccountOwner = user && user.issuer === issuer
  const alwaysPublicFields = { id, createdAt, name, bio, ethereumAddress, poeAddressVerified }
  const alwaysPrivateFields = { poeAddress, verified }

  ctx.body = {
    ...alwaysPublicFields,
    ...(isAccountOwner ? {
      ...alwaysPrivateFields,
      email,
    } : {
      ...(emailPublic && { email }),
    }),
  }
}
