import { describe } from 'riteway'
import { extractToken } from './authorization'

describe('extractToken()', async (assert: any) => {
  {
    const actual = extractToken({
      header: {
        token: 'foo',
      },
      params: {
        token: 'bar',
      },
    })

    assert({
      given: 'a token both in the context header and params properties',
      should: 'return the token from the header',
      actual,
      expected: 'foo',
    })
  }

  {
    const actual = extractToken({
      header: {},
      params: {
        token: 'bar',
      },
    })

    assert({
      given: 'a token only in the context params property',
      should: 'return the token from the params',
      actual,
      expected: 'bar',
    })
  }

  {
    const actual = extractToken({
      header: {},
      params: {},
    })

    assert({
      given: 'no token in the context header or params properties',
      should: 'return a string',
      actual,
      expected: '',
    })
  }
})
