import * as Joi from 'joi'
import { Context } from 'koa'

import { ValidateParams } from '../../middlewares/validate'

import { RegistryController } from '../../controllers/RegistryController'

export const GetRegistrySchema: ValidateParams = {
  query: () => ({
    ownerId: Joi.string(),
  }),
}

export const GetRegistry = (registryController: RegistryController) => async (ctx: Context): Promise<void> => {
  const { user } = ctx.state
  const { id } = ctx.params
  ctx.body = await registryController.getById(id)
}
