import { describe } from 'riteway'
import { PasswordChangeToken } from './PasswordChangeToken'

describe('PasswordChangeToken()', async (assert: any) => {
  {
    const ctx = {
      state: {
        tokenData: { data: { meta: { name: 'foo' } } },
      },
      status: 1,
    }

    await PasswordChangeToken()(ctx, (): any => undefined)

    assert({
      given: 'a missing password change token in the context state',
      should: 'set the status property of context to 500',
      actual: ctx.status,
      expected: 500,
    })
  }
})
