import * as Joi from 'joi'
import { WorkController } from '../../controllers/WorkController'

export const GetWorkSchema = () => ({
  workId: Joi.string().required(),
})

export const GetWork = (workController: WorkController) => async (ctx: any, next: any): Promise<any> => {
  const { workId } = ctx.params
  const { tokenData } = ctx.state

  const response = await workController.getById(workId, tokenData.data.meta.network)
  ctx.body = response.claim
}
