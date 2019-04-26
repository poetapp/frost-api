import { describe } from 'riteway'

import { logger } from '../../../tests/helpers/logger'
import { getTokensLengthByNetwork, getTokenByNetwork, isEmptyObject, extractNetwork } from './CreateToken'

const createCtx = (numTokens: number, body: object = {}) => ({
  state: {
    user: {
      apiTokens: [...Array(numTokens)],
      testApiTokens: [...Array(numTokens)],
    },
  },
  request: {
    body,
  },
  status: 1,
  logger,
})

describe('getTokenByNetwork()', async assert => {
  const apiToken = 'asdfjalskdfjkasdfjasdkfajs'

  assert({
    given: 'test and an apiToken',
    should: 'return TEST_apiToken ',
    actual: getTokenByNetwork('test', apiToken),
    expected: `TEST_${apiToken}`,
  })

  assert({
    given: 'live and an apiToken',
    should: 'return apiToken ',
    actual: getTokenByNetwork('live', apiToken),
    expected: apiToken,
  })
})

describe('getTokensLengthByNetwork()', async assert => {
  const user = {
    apiTokens: ['test', 'test2', 'test3'],
    testApiTokens: ['test', 'test2', 'test3', 'test4'],
  }

  assert({
    given: 'test and a user',
    should: 'correct user testApiTokens length',
    actual: getTokensLengthByNetwork('test', user),
    expected: 4,
  })

  assert({
    given: 'live and a user',
    should: 'return correct user apiTokens length',
    actual: getTokensLengthByNetwork('live', user),
    expected: 3,
  })
})

describe('isEmptyObject', async assert => {
  {
    const actual = isEmptyObject({})
    const expected = true

    assert({
      given: 'empty object',
      should: 'return true',
      actual,
      expected,
    })
  }

  {
    const actual = isEmptyObject({ key: 'value' })
    const expected = false

    assert({
      given: 'object with one key',
      should: 'return false',
      actual,
      expected,
    })
  }
})

describe('extractNetwork', async assert => {
  {
    const ctx = createCtx(4, { network: 'live' })

    assert({
      given: 'live network in ctx',
      should: 'return live',
      actual: extractNetwork(ctx),
      expected: 'live',
    })
  }
  {
    const ctx = createCtx(4, { network: 'test' })

    assert({
      given: 'test network in ctx',
      should: 'return test',
      actual: extractNetwork(ctx),
      expected: 'test',
    })
  }
  {
    const ctx = createCtx(4)

    assert({
      given: 'no network in ctx',
      should: 'return mainnet',
      actual: extractNetwork(ctx),
      expected: 'test',
    })
  }
})
