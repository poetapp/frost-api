import * as Joi from 'joi'
import { errors } from '../errors/errors'

interface ValidateParams {
  readonly query?: (values: object) => {}
  readonly body?: (values: object) => {}
  readonly params?: (values: object) => {}
  readonly options?: object
}

export const validate = (data: ValidateParams) => async (ctx: any, next: () => Promise<any>) => {
  try {
    const { query, body, params, options } = data
    /* tslint:disable:no-unused-expression */
    body && (await Joi.validate(ctx.request.body, body(ctx.request.body), options))
    query && (await Joi.validate(ctx.query, query(ctx.query), options))
    params && (await Joi.validate(ctx.params, params(ctx.params), options))
    return next()
  } catch (e) {
    const { InvalidInput } = errors
    return ctx.throw(InvalidInput.code, `${InvalidInput.message} ${e}`)
  }
}
