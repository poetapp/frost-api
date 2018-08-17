import { describe } from 'riteway'
import { CreateToken } from './CreateToken'

const createCtx = (numTokens: number) => ({
  state: {
    user: {
      apiTokens: [...Array(numTokens)],
    },
  },
  status: 1,
})

describe('CreateToken', async (should: any) => {
  const { assert } = should()

  {
    const ctx = createCtx(5)

    await CreateToken()(ctx, (): any => undefined)

    assert({
      given: 'exactly max api tokens',
      should: 'return a status of 409',
      actual: ctx.status,
      expected: 409,
    })
  }

  {
    const ctx = createCtx(6)

    await CreateToken()(ctx, (): any => undefined)

    assert({
      given: 'more than max api tokens',
      should: 'return a status of 409',
      actual: ctx.status,
      expected: 409,
    })
  }
})
