import { WorkController } from '../../controllers/WorkController'

export const GetWorks = (workController: WorkController) => async (ctx: any, next: any): Promise<any> => {
  const { user, tokenData } = ctx.state
  const { issuer } = user

  const response = await workController.searchWorks({ issuer }, tokenData.data.meta.network)

  ctx.body = response.map(work => work.claim)
}
