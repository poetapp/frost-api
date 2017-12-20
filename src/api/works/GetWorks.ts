import { errors } from '../../errors/errors'
import { ControllerApi } from '../../interfaces/ControllerApi'
import { WorksController } from '../../modules/Works/Works.controller'
import { WorkAttributes } from '../../utils/PoetNode/Interfaces/Interfaces'

export class GetWorks implements ControllerApi {
  async handler(ctx: any, next: any): Promise<any> {
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
      ctx.status = 500
    }
  }

  validate() {
    return {}
  }
}
