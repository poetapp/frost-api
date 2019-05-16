import * as Joi from 'joi'

import { AccountController } from '../../controllers/AccountController'
import { AccountAlreadyExists, Unauthorized } from '../../errors/errors'
import { signatureIsValid } from '../../helpers/ethereum'
import { ValidateParams } from '../../middlewares/validate'
import { Account } from '../../models/Account'

export const PatchAccountSchema: ValidateParams = {
  params: () => ({
    issuer: Joi.string().required(),
  }),
  body: () => ({
    email: Joi.string().optional(),
    name: Joi.string().allow('').optional(),
    bio: Joi.string().allow('').optional(),
    ethereumAddress: Joi.string().allow('').optional(),
    poeAddress: Joi.string().allow('').optional(),
    poeSignature: Joi.string().allow('').optional(),
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

  const poeAddressVerified = isPoeAddressVerified(body.poeAddress, body.poeSignature, user)

  await accountController.updateByIssuer(issuer, { ...body, poeAddressVerified })

  const { email, createdAt, name, bio, ethereumAddress, poeAddress, poeSignature } = user

  ctx.body = {
    email,
    createdAt,
    issuer,
    name,
    bio,
    ethereumAddress,
    poeAddress,
    poeSignature,
    poeAddressVerified,
    ...body,
  }
}

export const isPoeAddressVerified = (poeAddress: string, poeSignature: string, account: Account): boolean =>
  (poeAddress || poeSignature)
    ? signatureIsValid(
      poeAddress || account.poeAddress,
      account.poeAddressMessage,
      poeSignature || account.poeAddressSignature,
    )
    : !!account.poeAddressVerified
