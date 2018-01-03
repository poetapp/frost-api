import * as Joi from 'joi'
import { errors } from '../../errors/errors'
import { ControllerApi } from '../../interfaces/ControllerApi'
import { Vault } from '../../utils/Vault/Vault'

import { WorksController } from '../../modules/Works/Works.controller'

export class CreateWork implements ControllerApi {
  async handler(ctx: any, next: any): Promise<any> {
    try {
      const { user } = ctx.state
      const { WorkError } = errors
      const newWork = ctx.request.body
      const privateKey = await Vault.decrypt(user.privateKey)
      const work = new WorksController(privateKey, newWork)
      const claim = work.generateClaim()

      try {
        await work.create(claim)
      } catch (e) {
        ctx.status = WorkError.code
        ctx.body = WorkError.message
        return
      }

      ctx.status = 200
      ctx.body = { workId: claim.id }
    } catch (e) {
      ctx.status = 500
    }
  }

  validate() {
    return {
      name: Joi.string().required(),
      datePublished: Joi.string()
        .required()
        .isoDate(),
      dateCreated: Joi.string()
        .required()
        .isoDate(),
      author: Joi.string().required(),
      tags: Joi.string().required(),
      content: Joi.string().required()
    }
  }
}
