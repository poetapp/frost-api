import { describe } from 'riteway'
import { spy } from 'sinon'

import { logger } from '../../tests/helpers/logger'
import { requireEmailVerified } from './requireEmailVerified'

const createCtx = (verified: boolean) => ({
  state: {
    user: {
      verified,
    },
  },
  logger,
})

describe('requireEmailVerified() middleware', async (assert: any) => {
  {
    const next = spy()

    await requireEmailVerified()(createCtx(true), next)

    assert({
      given: 'a verified user in the context state',
      should: 'call next',
      actual: next.calledOnce,
      expected: true,
    })
  }

  {
    const next = spy()

    await requireEmailVerified()(createCtx(false), next)

    assert({
      given: 'a non-verified user in the context state',
      should: 'call next',
      actual: next.calledOnce,
      expected: false,
    })
  }
})
