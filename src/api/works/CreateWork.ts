import * as Joi from 'joi'

import { errors } from '../../errors/errors'
import { isLiveNetwork } from '../../helpers/token'
import { WorksController } from '../../modules/Works/Works.controller'
import { Vault } from '../../utils/Vault/Vault'

export const CreateWorkSchema = () => ({
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

export const CreateWork = (poetUrl: string, testPoetUrl: string) => async (ctx: any, next: any): Promise<any> => {
  const logger = ctx.logger(__dirname)

  try {
    const { user, tokenData } = ctx.state
    const { WorkError } = errors

    const newWork = ctx.request.body
    const privateKey = await Vault.decrypt(user.privateKey)
    const nodeNetwork = isLiveNetwork(tokenData.data.meta.network) ? poetUrl : testPoetUrl

    const work = new WorksController(ctx.logger, nodeNetwork)
    const claim = await work.generateClaim(user.issuer, privateKey, newWork)

    try {
      await work.create(claim)
    } catch (e) {
      ctx.status = WorkError.code
      ctx.body = WorkError.message
      return
    }

    ctx.status = 200
    ctx.body = { workId: claim.id }
  } catch (exception) {
    logger.error({ exception }, 'api.CreateWork')
    ctx.status = 500
  }
}
