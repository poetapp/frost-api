import { describe } from 'riteway'
import { tokenMatch, isLiveNetwork } from './utils'

describe('tokenMatch()', async (assert: any) => {
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

describe('isLiveNetwork()', async assert => {
  assert({
    given: 'test',
    should: 'return false',
    actual: isLiveNetwork('test'),
    expected: false,
  })

  assert({
    given: 'live',
    should: 'return true',
    actual: isLiveNetwork('live'),
    expected: true,
  })

  assert({
    given: 'random string',
    should: 'return false',
    actual: isLiveNetwork('random string'),
    expected: false,
  })
})
