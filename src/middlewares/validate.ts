import * as Joi from 'joi'
import { errors } from '../errors/errors'

export interface ValidateParams {
  readonly query?: (values: object, ctx: any) => {}
  readonly body?: (values: object, ctx: any) => {}
  readonly params?: (values: object, ctx: any) => {}
  readonly options?: object
}

export const validate = (data: ValidateParams) => async (ctx: any, next: () => Promise<any>) => {
  try {
    const { query, body, params, options } = data
    /* tslint:disable:no-unused-expression */
    body && (await Joi.validate(ctx.request.body, body(ctx.request.body, ctx), options))
    query && (await Joi.validate(ctx.query, query(ctx.query, ctx), options))
    params && (await Joi.validate(ctx.params, params(ctx.params, ctx), options))
    return next()
  } catch (e) {
    const { InvalidInput } = errors
    return ctx.throw(InvalidInput.code, `${InvalidInput.message} ${e}`)
  }
}
