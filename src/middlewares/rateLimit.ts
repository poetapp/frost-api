const Redis = require('ioredis')
const RateLimiter = require('async-ratelimiter')

import { errors } from '../errors/errors'

export interface LimiterConfiguration {
  readonly max: number
  readonly duration: number
}

export interface RedisConfiguration {
  readonly redisPort: number
  readonly redisHost: string
}
export interface RateLimitConfiguration extends RedisConfiguration {
  readonly rateLimitDisabled: boolean
}

const { RateLimitReached } = errors

const limiter = ({ redisPort, redisHost }: RedisConfiguration) => ({ max = 2500, duration = 3600000 }) =>
  new RateLimiter({
    db: new Redis(redisPort, redisHost),
    max,
    duration,
  })

export const RateLimit = (rateLimitConfiguration: RateLimitConfiguration) => (
  limiterConfiguration: LimiterConfiguration,
) => {
  const { redisPort, redisHost, rateLimitDisabled } = rateLimitConfiguration
  const limiters = limiter({ redisPort, redisHost })

  return async (ctx: any, next: any) => {
    if (rateLimitDisabled) return next()
    const limit = await limiters(limiterConfiguration).get({ id: ctx.request.ip })
    ctx.set('X-Rate-Limit-Limit', limit.total)
    ctx.set('X-Rate-Limit-Remaining', Math.max(0, limit.remaining - 1))
    ctx.set('X-Rate-Limit-Reset', limit.reset)

    return !limit.remaining ? ctx.throw(RateLimitReached.code, RateLimitReached.message) : next()
  }
}
