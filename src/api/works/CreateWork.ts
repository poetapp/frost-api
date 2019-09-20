import * as Joi from 'joi'

import { WorkController } from '../../controllers/WorkController'

export const CreateWorkSchema = () => ({
  '@context': Joi.alternatives(
    Joi.string(),
    Joi.object(),
  ).optional(),
  name: Joi.string().required(),
  datePublished: Joi.string()
    .required()
    .isoDate(),
  dateCreated: Joi.string()
    .required()
    .isoDate(),
  author: Joi.string().required(),
  tags: Joi.string().allow(''),
  content: Joi.any().optional(),
  hash: Joi.string().optional(),
  archiveUrl: Joi.string()
    .uri({ scheme: ['https', 'http', 'ipfs'] })
    .optional(),
})

export const CreateWork = (workController: WorkController) => async (ctx: any, next: any): Promise<any> => {
  const { user, tokenData } = ctx.state

  const { '@context': context = {}, ...claim } = ctx.request.body

  const signedVerifiableClaim = await workController.create(
    claim,
    context,
    user.issuer,
    user.privateKey,
    tokenData.data.meta.network,
  )

  ctx.status = 200
  ctx.body = { workId: signedVerifiableClaim.id }
}
