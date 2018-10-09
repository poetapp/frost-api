import { Context } from 'koa'
import { describe } from 'riteway'

import { GetHealth } from './GetHealth'

describe('GetHealth()', async (assert: any) => {
  {
    const ctx = {} as Context
    const next = (): any => undefined
    await GetHealth()(ctx, next)

    assert({
      given: 'empty ctx object',
      should: 'set ctx.status to 200',
      actual: ctx.status === 200,
      expected: true,
    })
  }
  {
    const ctx = { status: 500 } as Context
    const next = (): any => undefined
    await GetHealth()(ctx, next)

    assert({
      given: 'ctx object with status',
      should: 'set ctx.status to 200',
      actual: ctx.status === 200,
      expected: true,
    })
  }
})
