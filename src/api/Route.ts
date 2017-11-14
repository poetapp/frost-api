import * as Joi from 'joi'
import { ControllerApi } from '../interfaces/ControllerApi'
import { errors } from './errors/errors'
export class Route {
  private router: any

  constructor(router: any) {
    this.router = router
  }

  set(method: string, path: string, controllerApi: ControllerApi) {
    this.router[method](path, this.handler(controllerApi))
  }

  handler(controllerApi: ControllerApi) {
    return async (ctx: any, next: any) => {
      const data = ctx.request.body

      try {
        await Joi.validate(data, controllerApi.validate())
      } catch (e) {
        const { InvalidInput } = errors
        return ctx.throw(InvalidInput.code, InvalidInput.message + e.message)
      }

      await controllerApi.handler(ctx, next)
    }
  }
}
