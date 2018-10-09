import { describe } from 'riteway'

import { getLimiter, RateLimit, loginLimiter, accountLimiter, passwordLimiter, defaultLimiter } from './rateLimit'

describe('getLimiter', async (assert: any) => {
  assert({
    given: `${RateLimit.LOGIN}`,
    should: 'return loginLimiter',
    actual: getLimiter(RateLimit.LOGIN),
    expected: loginLimiter,
  })

  assert({
    given: `${RateLimit.ACCOUNT}`,
    should: 'return createAccountLimiter',
    actual: getLimiter(RateLimit.ACCOUNT),
    expected: accountLimiter,
  })

  assert({
    given: `${RateLimit.PASSWORD}`,
    should: 'return passwordLimiter',
    actual: getLimiter(RateLimit.PASSWORD),
    expected: passwordLimiter,
  })

  assert({
    given: 'bad string',
    should: 'return default limiter',
    actual: getLimiter('bad string'),
    expected: defaultLimiter,
  })
})
