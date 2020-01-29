import * as Joi from 'joi'

import { ValidateParams } from '../../middlewares/validate'

import { RegistryController } from '../../controllers/RegistryController'

export const PostRegistrySchema: ValidateParams = {
  body: () => ({
    address: Joi.string().required(),
  }),
}

export const PostRegistry = (registryController: RegistryController) => async (
  ctx: any,
): Promise<any> => {
  const { user } = ctx.state
  const { address } = ctx.request.body
  await registryController.create(user.id, address)
  ctx.status = 200
}
