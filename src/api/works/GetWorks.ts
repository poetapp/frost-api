import { SignedVerifiableClaim } from '@po.et/poet-js'
import { errors } from '../../errors/errors'
import { WorksController } from '../../modules/Works/Works.controller'
import { Vault } from '../../utils/Vault/Vault'
import { isLiveNetwork } from '../accounts/utils/utils'

export const GetWorks = (poetUrl: string, testPoetUrl: string) => async (ctx: any, next: any): Promise<any> => {
  const logger = ctx.logger(__dirname)

  try {
    const { user, tokenData } = ctx.state
    const privateKey = await Vault.decrypt(user.privateKey)
    const {
      data: {
        meta: { network },
      },
    } = tokenData

    const nodeNetwork = isLiveNetwork(network) ? poetUrl : testPoetUrl

    const worksController = new WorksController(nodeNetwork, privateKey)

    try {
      const response = await worksController.getWorksByIssuer()

      ctx.body = response.map((work: SignedVerifiableClaim) => work.claim)
      return
    } catch (e) {
      const { WorkNotFound } = errors
      ctx.status = WorkNotFound.code
      ctx.body = WorkNotFound.message
    }
  } catch (exception) {
    logger.error({ exception }, 'api.GetWorks')
    ctx.status = 500
  }
}
