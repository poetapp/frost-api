import { describe } from 'riteway'
import { spy } from 'sinon'
import { RateLimit } from './rateLimit'

describe('rateLimit middleware', async (assert: any) => {
  {
    const next = spy()
    const ctx = {}
    const redisDB: any = null
    const rateLimit = RateLimit(redisDB)({ rateLimitDisabled: true })

    await rateLimit({ max: 1, duration: 1 })(ctx, next)

    const actual = next.calledOnce
    const expected = true

    assert({
      given: 'rateLimitDisabled on true',
      should: 'be called next',
      actual,
      expected,
    })
  }
})
