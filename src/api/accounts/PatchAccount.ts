import { create as createEthereumAccount } from 'eth-lib/lib/account'
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
    emailPublic: Joi.boolean().optional(),
    name: Joi.string().allow('').optional(),
    bio: Joi.string().allow('').optional(),
    ethereumAddress: Joi.string().allow('').optional(),
    poeAddress: Joi.string().allow('').optional(),
    poeSignature: Joi.string().allow('').optional(),
    ethereumRegistryPrivateKey: Joi.boolean().optional(),
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

  const getEthereumRegistryAccountUpdates = (): Partial<Account> => {
    if (user.ethereumRegistryPrivateKey)
      return {}
    if (body.ethereumRegistryPrivateKey) {
      const { privateKey, address } = createEthereumAccount()
      return { ethereumRegistryPrivateKey: privateKey, ethereumRegistryAddress: address }
    }
    return {}
  }

  const ethereumRegistryAccountUpdates = getEthereumRegistryAccountUpdates()

  const poeAddressVerified = isPoeAddressVerified(body.poeAddress, body.poeSignature, user)

  const { ethereumRegistryPrivateKey: hiddenEthereumRegistryPrivateKey, ...bodyWithoutHiddenFields } = body

  await accountController.updateByIssuer(issuer, {
    ...bodyWithoutHiddenFields,
    poeAddressVerified,
    ...ethereumRegistryAccountUpdates,
  })

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
    ...bodyWithoutHiddenFields,
  }
}

export const isPoeAddressVerified = (poeAddress: string, poeSignature: string, account: Account): boolean =>
  (poeAddress !== undefined || poeSignature !== undefined) // TODO: https://github.com/microsoft/TypeScript/issues/26578
    ? signatureIsValid(
        poeAddress !== undefined ? poeAddress : account.poeAddress,
        account.poeAddressMessage,
        poeSignature !== undefined ? poeSignature : account.poeAddressSignature,
      )
    : !!account.poeAddressVerified
