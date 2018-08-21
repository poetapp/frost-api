import { pick } from 'ramda'
import { describe } from 'riteway'
import { spy } from 'sinon'

import { GetProfile } from './GetProfile'

describe('GetProfile', async (should: any) => {
  const { assert } = should()

  {
    const ctx = {
      state: {
        user: {
          createdAt: 'date_created',
          verified: 'verified_status',
          email: 'email_address',
          other: 'foo',
        },
      },
      body: {},
    }

    await GetProfile()(ctx, () => ({}))

    assert({
      given: 'a "user" property in the context "state" property',
      should: 'returns an object with "createdAt", "email" and "verified" properties',
      actual: ctx.body,
      expected: pick(['createdAt', 'verified', 'email'], ctx.state.user),
    })
  }

  {
    const ctx = {
      state: {},
      throw: spy(),
    }

    await GetProfile()(ctx, () => ({}))

    assert({
      given: 'a context state without a user object',
      should: 'throw an internal server error',
      actual: ctx.throw.calledOnce,
      expected: true,
    })
  }
})
