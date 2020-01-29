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
  const { user } = ctx.state

  logger.info({ issuer }, 'GetAccount')

  const account = await accountController.findByIssuer(issuer)

  if (!account)
    throw new AccountNotFound()

  const {
    id, email, verified, emailPublic, createdAt, name, bio, ethereumAddress, poeAddress, poeAddressVerified,
    ethereumRegistryAddress,
  } = account

  const isAccountOwner = user && user.issuer === issuer
  const alwaysPublicFields = { id, createdAt, name, bio, ethereumAddress, poeAddressVerified }
  const alwaysPrivateFields = { poeAddress, verified, ethereumRegistryAddress }

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
