import * as Joi from 'joi'
import { errors } from '../../errors/errors'
import { ControllerApi } from '../../interfaces/ControllerApi'

export enum Method {
  POST = 'post',
  GET = 'get',
  PUT = 'put',
  DEL = 'del',
  ALL = 'all',
}
export class Route {
  private router: any

  constructor(router: any) {
    this.router = router
  }

  set(method: Method, path: string, controllerApi: ControllerApi) {
    this.router[method](path, this.handler(controllerApi))
  }

  handler(controllerApi: ControllerApi) {
    return async (ctx: any, next: any) => {
      const data = ctx.request.body
      const options = controllerApi.validateOptions ? controllerApi.validateOptions() : {}
      try {
        await Joi.validate(data, controllerApi.validate(data), options)
      } catch (e) {
        const { InvalidInput } = errors
        return ctx.throw(InvalidInput.code, `${InvalidInput.message} ${e}`)
      }

      await controllerApi.handler(ctx, next)
    }
  }
}
