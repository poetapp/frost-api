import { WorkAttributes } from '@po.et/poet-js'
import { errors } from '../../errors/errors'
import { WorksController } from '../../modules/Works/Works.controller'
import { logger } from '../../utils/Logger/Logger'

export const GetWorks = () => async (ctx: any, next: any): Promise<any> => {
  try {
    const { user } = ctx.state
    const { publicKey } = user

    const worksController = new WorksController()
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
