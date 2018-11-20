const RateLimiter = require('async-ratelimiter')

import { errors } from '../errors/errors'

export interface LimiterConfiguration {
  readonly max: number
  readonly duration: number
}

export interface RateLimitConfiguration {
  readonly rateLimitDisabled: boolean
}

const { RateLimitReached } = errors

const limiter = (db: any) => ({ max = 2500, duration = 3600000 }) =>
  new RateLimiter({ db, max, duration })

export const RateLimit = (db: any) => (rateLimitConfiguration: RateLimitConfiguration) => (
  limiterConfiguration: LimiterConfiguration,
) => {
  const limiters = limiter(db)

  return async (ctx: any, next: any) => {
    if (rateLimitConfiguration.rateLimitDisabled) return await next()

    const limit = await limiters(limiterConfiguration).get({ id: ctx.request.ip })
    ctx.set('X-Rate-Limit-Limit', limit.total)
    ctx.set('X-Rate-Limit-Remaining', Math.max(0, limit.remaining - 1))
    ctx.set('X-Rate-Limit-Reset', limit.reset)

    return !limit.remaining ? ctx.throw(RateLimitReached.code, RateLimitReached.message) : await next()
  }
}
