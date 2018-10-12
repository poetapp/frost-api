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

describe('CreateToken', async (assert: any) => {
  {
    const ctx = createCtx(5)

    await CreateToken(5)(ctx, (): any => undefined)

    assert({
      given: 'exactly max api tokens',
      should: 'return a status of 409',
      actual: ctx.status,
      expected: 409,
    })
  }

  {
    const ctx = createCtx(6)

    await CreateToken(5)(ctx, (): any => undefined)

    assert({
      given: 'more than max api tokens',
      should: 'return a status of 409',
      actual: ctx.status,
      expected: 409,
    })
  }
})
