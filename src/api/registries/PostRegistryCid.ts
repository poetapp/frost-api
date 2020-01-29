import * as Joi from 'joi'

import { ValidateParams } from '../../middlewares/validate'

import { RegistryController } from '../../controllers/RegistryController'

export const PostRegistryCidSchema: ValidateParams = {
  body: () => ({
    cid: Joi.string().required(),
  }),
}

export const PostRegistryCid = (registryController: RegistryController) => async (
  ctx: any,
): Promise<any> => {
  const { user } = ctx.state
  const { id } = ctx.params
  const { cid } = ctx.request.body
  await registryController.addCid(user.id, id, cid)
  ctx.status = 200
}
