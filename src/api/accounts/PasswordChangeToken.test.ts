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

    const pwnedCheckerRoot = ''
    const accountVerified = false

    await PasswordChangeToken(accountVerified, pwnedCheckerRoot)(ctx, (): any => undefined)

    assert({
      given: 'a missing password change token in the context state',
      should: 'set the status property of context to 500',
      actual: ctx.status,
      expected: 500,
    })
  }
})
