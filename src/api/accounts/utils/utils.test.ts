import { describe } from 'riteway'
import { tokenMatch } from './utils'

describe('tokenMatch()', async (should: any) => {
  const { assert } = should()

  {
    const tokenData = { data: { meta: { name: 'foo' } } }
    const targetToken = { meta: { name: 'foo' } }

    assert({
      given: 'meta.name properties that match',
      should: 'return true',
      actual: tokenMatch(targetToken)(tokenData.data),
      expected: true,
    })
  }

  {
    const tokenData = { data: { meta: { name: 'foo' } } }
    const targetToken = { meta: { name: 'bar' } }

    assert({
      given: 'meta.name properties that do not match',
      should: 'return false',
      actual: tokenMatch(targetToken)(tokenData.data),
      expected: false,
    })
  }

  {
    const tokenData = { data: { meta: {} } }
    const targetToken = { meta: { name: 'bar' } }

    assert({
      given: 'token data without a name property',
      should: 'return false',
      actual: tokenMatch(targetToken)(tokenData.data),
      expected: false,
    })
  }

  {
    const tokenData = { data: { meta: { name: 'foo' } } }
    const targetToken = { meta: {} }

    assert({
      given: 'target token data without a name property',
      should: 'return false',
      actual: tokenMatch(targetToken)(tokenData.data),
      expected: false,
    })
  }
})
