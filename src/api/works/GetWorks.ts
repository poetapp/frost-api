import { WorkAttributes } from '@po.et/poet-js'
import { errors } from '../../errors/errors'
import { WorksController } from '../../modules/Works/Works.controller'
import { logger } from '../../utils/Logger/Logger'
import { isLiveNetwork } from '../accounts/utils/utils'

export const GetWorks = (poetUrl: string, testPoetUrl: string) => async (ctx: any, next: any): Promise<any> => {
  try {
    const { user, tokenData } = ctx.state
    const { publicKey } = user
    const {
      data: {
        meta: { network },
      },
    } = tokenData

    const nodeNetwork = isLiveNetwork(network) ? poetUrl : testPoetUrl

    const worksController = new WorksController(nodeNetwork)

    try {
      const response = await worksController.getWorksByPublicKey(publicKey)

      ctx.body = response.map((work: WorkAttributes) => work.attributes)
      return
    } catch (e) {
      const { WorkNotFound } = errors
      ctx.status = WorkNotFound.code
      ctx.body = WorkNotFound.message
    }
  } catch (e) {
    logger.error('api.GetWorks', e)
    ctx.status = 500
  }
}
