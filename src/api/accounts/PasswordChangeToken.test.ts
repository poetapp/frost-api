import { describe } from 'riteway'
import { PasswordChangeToken, tokenMatch } from './PasswordChangeToken'

describe('tokenMatch()', async (should: any) => {
  const { assert } = should()

  {
    const tokenData = { data: { meta: { name: 'foo' } } }
    const targetToken = { meta: { name: 'foo' } }

    assert({
      given: 'meta.name properties that match',
      should: 'return true',
      actual: tokenMatch(targetToken)(tokenData),
      expected: true,
    })
  }

  {
    const tokenData = { data: { meta: { name: 'foo' } } }
    const targetToken = { meta: { name: 'bar' } }

    assert({
      given: 'meta.name properties that do not match',
      should: 'return false',
      actual: tokenMatch(targetToken)(tokenData),
      expected: false,
    })
  }

  {
    const tokenData = { data: { meta: {} } }
    const targetToken = { meta: { name: 'bar' } }

    assert({
      given: 'token data without a name property',
      should: 'return false',
      actual: tokenMatch(targetToken)(tokenData),
      expected: false,
    })
  }

  {
    const tokenData = { data: { meta: { name: 'foo' } } }
    const targetToken = { meta: {} }

    assert({
      given: 'target token data without a name property',
      should: 'return false',
      actual: tokenMatch(targetToken)(tokenData),
      expected: false,
    })
  }
})

describe('PasswordChangeToken()', async (should: any) => {
  const { assert } = should()

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
