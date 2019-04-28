import * as Joi from 'joi'
import { errors } from '../../errors/errors'
import { isLiveNetwork } from '../../helpers/token'
import { WorksController } from '../../modules/Works/Works.controller'

export const GetWorkSchema = () => ({
  workId: Joi.string().required(),
})

export const GetWork = (poetUrl: string, testPoetUrl: string) => async (ctx: any, next: any): Promise<any> => {
  const logger = ctx.logger(__dirname)

  try {
    const { workId } = ctx.params
    const { tokenData } = ctx.state

    const nodeNetwork = isLiveNetwork(tokenData.data.meta.network) ? poetUrl : testPoetUrl

    const worksController = new WorksController(ctx.logger, nodeNetwork)

    try {
      const response = await worksController.get(workId)
      ctx.body = response.claim
      return
    } catch (e) {
      const { WorkNotFound } = errors
      ctx.status = WorkNotFound.code
      ctx.body = WorkNotFound.message
    }
  } catch (exception) {
    logger.error({ exception }, 'api.GetWork')
    ctx.status = 500
  }
}
