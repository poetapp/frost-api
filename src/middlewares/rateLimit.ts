const Redis = require('ioredis')
const RateLimiter = require('async-ratelimiter')

import { configuration } from '../configuration'
import { errors } from '../errors/errors'

export enum RateLimit {
  LOGIN = 'login',
  ACCOUNT = 'create_account',
  PASSWORD = 'password',
}

const {
  redisPort,
  redisHost,
  loginRateLimitMax,
  accountRateLimitMax,
  passwordChangeRateLimitMax,
  accountRateLimitDuration,
  loginRateLimitDuration,
  passwordChangeRateLimitDuration,
  rateLimitDisabled,
} = configuration
const { RateLimitReached } = errors

const limiter = (max = 2500, duration = 3600000) =>
  new RateLimiter({
    db: new Redis(redisPort, redisHost),
    max,
    duration,
  })

export const loginLimiter = () => limiter(loginRateLimitMax, loginRateLimitDuration)
export const accountLimiter = () => limiter(accountRateLimitMax, accountRateLimitDuration)
export const passwordLimiter = () => limiter(passwordChangeRateLimitMax, passwordChangeRateLimitDuration)
export const defaultLimiter = () => limiter()

export const getLimiter = (route: string) =>
  route === RateLimit.LOGIN
    ? loginLimiter
    : route === RateLimit.ACCOUNT
      ? accountLimiter
      : route === RateLimit.PASSWORD
        ? passwordLimiter
        : defaultLimiter

export const rateLimiter = (route: string) => {
  return async (ctx: any, next: any) => {
    if (rateLimitDisabled) return next()
    const limiters = getLimiter(route)
    const limit = await limiters().get({ id: ctx.request.ip })
    ctx.set('X-Rate-Limit-Limit', limit.total)
    ctx.set('X-Rate-Limit-Remaining', Math.max(0, limit.remaining - 1))
    ctx.set('X-Rate-Limit-Reset', limit.reset)

    return !limit.remaining ? ctx.throw(RateLimitReached.code, RateLimitReached.message) : next()
  }
}
