import { describe } from 'riteway'
import { spy } from 'sinon'

import { Token } from '../api/Tokens'
import { isLoggedIn } from './isLoggedIn'

const createCtx = (name: string) => ({
  state: {
    tokenData: {
      data: {
        meta: {
          name,
        },
      },
    },
  },
})

describe('isLoggedIn() middleware', async (assert: any) => {
  {
    const next = spy()

    await isLoggedIn()(createCtx('foo'), next)

    assert({
      given: 'no login token in the context state',
      should: 'not call next',
      actual: next.calledOnce,
      expected: false,
    })
  }

  {
    const next = spy()

    await isLoggedIn()(createCtx(Token.Login.meta.name), next)

    assert({
      given: 'a login token in the context state',
      should: 'call next',
      actual: next.calledOnce,
      expected: true,
    })
  }
})
