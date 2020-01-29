import * as Joi from 'joi'
import { Context } from 'koa'

import { ValidateParams } from '../../middlewares/validate'

import { RegistryController } from '../../controllers/RegistryController'

export const FindRegistriesSchema: ValidateParams = {
  query: () => ({
    ownerId: Joi.string(),
  }),
}

export const FindRegistries = (registryController: RegistryController) => async (ctx: Context): Promise<void> => {
  const { user } = ctx.state
  const { ownerId } = ctx.query
  ctx.body = await registryController.getByOwner(ownerId)
}
