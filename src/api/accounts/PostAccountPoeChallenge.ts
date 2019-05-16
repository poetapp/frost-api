import * as Joi from 'joi'

import { AccountController } from '../../controllers/AccountController'
import { Unauthorized } from '../../errors/errors'
import { ValidateParams } from '../../middlewares/validate'

export const PostAccountPoeChallengeSchema: ValidateParams = {
  params: () => ({
    issuer: Joi.string().required(),
  }),
  body: () => ({}),
}

export const PostAccountPoeChallenge = (
  accountController: AccountController,
) => async (ctx: any, next: any): Promise<void> => {
  const logger = ctx.logger(__dirname)
  const { issuer } = ctx.params
  const { user } = ctx.state

  logger.debug({ issuer, user }, 'PostAccountPoeChallenge')

  if (user.issuer !== issuer)
    throw new Unauthorized()

  const poeAddressMessage = await accountController.poeAddressChallenge(issuer)

  ctx.body = { poeAddressMessage }
}
