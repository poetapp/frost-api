import { Context } from 'koa'
import { compose } from 'ramda'
import { describe } from 'riteway'
import { spy } from 'sinon'

import { configureKOAHandler } from './configure-koa-handler'

describe('configureKOAHandler()', async (assert: any) => {
  {
    const initialFeatures = [{ name: 'foo', isActive: false }, { name: 'login', isActive: true }]
    const inactiveHandler = spy()
    const activeHandler = spy()
    const next = () => Promise.resolve()
    const ctx = {} as Context

    const createKOAHandler = configureKOAHandler({ initialFeatures })

    const handler = createKOAHandler(inactiveHandler)('login')(activeHandler)

    await handler(ctx, next)

    assert({
      given: 'an active feature',
      should: 'call the active handler',
      actual: activeHandler.calledOnce,
      expected: true,
    })

    assert({
      given: 'an active feature',
      should: 'call the active handler with the correct arguments',
      actual: activeHandler.calledWith(ctx, next),
      expected: true,
    })

    assert({
      given: 'an active feature',
      should: 'not call the inactive handler',
      actual: inactiveHandler.calledOnce,
      expected: false,
    })
  }
  {
    const initialFeatures = [{ name: 'foo', isActive: false }, { name: 'login', isActive: false }]
    const inactiveHandler = spy()
    const activeHandler = spy()
    const next = () => Promise.resolve()
    const ctx = {} as Context

    const createKOAHandler = configureKOAHandler({ initialFeatures })

    const handler = createKOAHandler(inactiveHandler)('login')(activeHandler)

    await handler(ctx, next)

    assert({
      given: 'an inactive feature',
      should: 'not call the active handler',
      actual: activeHandler.calledOnce,
      expected: false,
    })

    assert({
      given: 'an inactive feature',
      should: 'call the inactive handler',
      actual: inactiveHandler.calledOnce,
      expected: true,
    })

    assert({
      given: 'an inactive feature',
      should: 'call the inactive handler with the correct arguments',
      actual: inactiveHandler.calledWith(ctx, next),
      expected: true,
    })
  }
  {
    const initialFeatures = [{ name: 'foo', isActive: false }, { name: 'login', isActive: false }]
    const inactiveHandler = spy()
    const activeHandler = spy()
    const next = () => Promise.resolve()
    const query = { ft: 'login,help', foo: 'bar' }
    const ctx = { query } as Context

    const createKOAHandler = configureKOAHandler({ initialFeatures })

    const handler = createKOAHandler(inactiveHandler)('login')(activeHandler)

    await handler(ctx, next)

    assert({
      given: 'an inactive feature and query that enables the feature',
      should: 'call the active handler',
      actual: activeHandler.calledOnce,
      expected: true,
    })

    assert({
      given: 'an inactive feature and query that enables the feature',
      should: 'call the active handler with the correct arguments',
      actual: activeHandler.calledWith(ctx, next),
      expected: true,
    })

    assert({
      given: 'an inactive feature and query that enables the feature',
      should: 'not call the inactive handler',
      actual: inactiveHandler.calledOnce,
      expected: false,
    })
  }

  {
    const initialFeatures = [
      { name: 'foo', isActive: true },
      { name: 'baz', isActive: false },
      { name: 'bar', isActive: true },
    ]

    const createKOAHandler = configureKOAHandler({ initialFeatures })

    const throw404 = spy()
    const featureOr404 = createKOAHandler(throw404)

    const fooFeatureOr404 = featureOr404('foo')
    const barFeatureOr404 = featureOr404('bar')
    const bazFeatureOr404 = featureOr404('baz')

    const next = () => Promise.resolve()
    const ctx = {} as Context

    const handlerComposition = compose(
      fooFeatureOr404,
      barFeatureOr404,
      bazFeatureOr404
    )

    const featureHandler = spy()

    const handler = handlerComposition(featureHandler)

    await handler(ctx, next)

    assert({
      given: 'composed handlers one of which is for an inactive feature',
      should: 'call the inactive handler only once',
      actual: throw404.calledOnce,
      expected: true,
    })

    assert({
      given: 'composed handlers one of which is for an inactive feature',
      should: 'call the inactive handler with the correct arguments',
      actual: throw404.calledWith(ctx, next),
      expected: true,
    })

    assert({
      given: 'composed handlers one of which is for an inactive feature',
      should: 'not call the feature handler',
      actual: featureHandler.called,
      expected: false,
    })
  }
  {
    const initialFeatures = [
      { name: 'foo', isActive: true },
      { name: 'baz', isActive: true },
      { name: 'bar', isActive: true },
    ]

    const createKOAHandler = configureKOAHandler({ initialFeatures })

    const throw404 = spy()
    const featureOr404 = createKOAHandler(throw404)

    const fooFeatureOr404 = featureOr404('foo')
    const barFeatureOr404 = featureOr404('bar')
    const bazFeatureOr404 = featureOr404('bar')

    const next = () => Promise.resolve()
    const ctx = {} as Context

    const handlerComposition = compose(
      fooFeatureOr404,
      barFeatureOr404,
      bazFeatureOr404
    )

    const featureHandler = spy()

    const handler = handlerComposition(featureHandler)

    await handler(ctx, next)

    assert({
      given: 'all active features',
      should: 'call the feature handler',
      actual: featureHandler.calledOnce,
      expected: true,
    })

    assert({
      given: 'composed handlers and all active features',
      should: 'call the feature handler with the correct arguments',
      actual: featureHandler.calledWith(ctx, next),
      expected: true,
    })

    assert({
      given: 'composed handlers and all active features',
      should: 'not call any of the inactive handlers handler',
      actual: throw404.called,
      expected: false,
    })
  }
})
