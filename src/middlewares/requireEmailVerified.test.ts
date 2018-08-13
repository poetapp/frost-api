import { describe } from 'riteway'
import { spy } from 'sinon'
import { requireEmailVerified } from './requireEmailVerified'

const createCtx = (verified: boolean) => ({
  state: {
    user: {
      verified,
    },
  },
})

describe('requireEmailVerified() middleware', async (should: any) => {
  const { assert } = should('')

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
