import * as Joi from 'joi'
import { errors } from '../../errors/errors'
import { WorksController } from '../../modules/Works/Works.controller'
import { logger } from '../../utils/Logger/Logger'
import { isLiveNetwork } from '../accounts/utils/utils'

export const GetWorkSchema = () => ({
  workId: Joi.string().required(),
})

export const GetWork = (poetUrl: string, testPoetUrl: string) => async (ctx: any, next: any): Promise<any> => {
  try {
    const { workId } = ctx.params
    const { tokenData } = ctx.state
    const {
      data: {
        meta: { network },
      },
    } = tokenData

    const nodeNetwork = isLiveNetwork(network) ? poetUrl : testPoetUrl

    const worksController = new WorksController(nodeNetwork)

    try {
      const response = await worksController.get(workId)
      ctx.body = response.claim
      return
    } catch (e) {
      const { WorkNotFound } = errors
      ctx.status = WorkNotFound.code
      ctx.body = WorkNotFound.message
    }
  } catch (e) {
    logger.error('api.GetWork', e)
    ctx.status = 500
  }
}
