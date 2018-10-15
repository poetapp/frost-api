import { Token } from 'api/Tokens'
import { describe } from 'riteway'
import { spy } from 'sinon'
import { requireApiToken, isRequiredToken } from './requireApiToken'

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

describe('requireApiToken() middleware', async assert => {
  {
    const next = spy()

    await requireApiToken()(createCtx('api_key'), next)

    assert({
      given: 'an apiToken in header',
      should: 'call next',
      actual: next.calledOnce,
      expected: true,
    })
  }

  {
    const next = spy()

    await requireApiToken()(createCtx('test_api_key'), next)

    assert({
      given: 'an testApiToken in header',
      should: 'call next',
      actual: next.calledOnce,
      expected: true,
    })
  }

  {
    const next = spy()

    await requireApiToken()(createCtx('login'), next)

    assert({
      given: 'a non-valid token in header',
      should: 'throw error',
      actual: next.calledOnce,
      expected: false,
    })
  }
})

describe('isRequiredToken()', async assert => {
  const createToken = (name: string) => ({
    data: {
      meta: {
        name,
      },
    },
  })
  assert({
    given: 'apiToken',
    should: 'return true',
    actual: isRequiredToken(createToken(Token.ApiKey.meta.name)),
    expected: true,
  })

  assert({
    given: 'testApiToken',
    should: 'return true',
    actual: isRequiredToken(createToken(Token.TestApiKey.meta.name)),
    expected: true,
  })

  assert({
    given: 'login token',
    should: 'return false',
    actual: isRequiredToken(createToken(Token.Login.meta.name)),
    expected: false,
  })
})
