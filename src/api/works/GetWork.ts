import * as Joi from 'joi'
import { errors } from '../../errors/errors'
import { WorksController } from '../../modules/Works/Works.controller'
import { logger } from '../../utils/Logger/Logger'

export const GetWorkSchema = () => ({
  workId: Joi.string().required(),
})

export const GetWork = () => async (ctx: any, next: any): Promise<any> => {
  try {
    const { workId } = ctx.params
    const worksController = new WorksController()
    try {
      const response = await worksController.get(workId)
      ctx.body = response.attributes
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
