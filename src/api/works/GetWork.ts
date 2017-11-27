import { ControllerApi } from '../../interfaces/ControllerApi'
import { errors } from '../errors/errors'

import { WorksController } from '../../modules/Works/Works'

export class GetWork implements ControllerApi {
  async handler(ctx: any, next: any): Promise<any> {
    try {
      const { workId } = ctx.params
      const worksController = new WorksController()
      try {
        const response = await worksController.get(workId)
        ctx.body = response
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
