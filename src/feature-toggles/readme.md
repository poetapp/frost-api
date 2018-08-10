# Feature Toggles

Feature toggles allow us define active and inactive features in an array of initial features. Code can then be exectued condiontally based on whether a feature is active or inactive. Features can also be actived by adding the feature name to the `ft` search param of an endpoint. 

## Activating a Feature by search param.

Say we had a feature page called `foo`, and its endpoint is `/foo`. `foo` is inactive by default so the endpoint returns a 404 by default. We can activate the feature from a client by adding `?ft=foo` to the endpoint, `/foo?ft=foo`.

## Adding feature toggles to an endpoint.

We have created a configurable higher order function to add feature toggles to koa endpoints, configure-koa-handler.ts

### How configureKOAHandler() works.

#### Function signature

```js
const configureKOAHandler =  ({ initialFeatures }) => inactiveHandler => feature => activeHandler => (ctx, next) => Promise<void>
```

#### Using it

```js
import { configureKOAHandler } from 'feature-toggles'

const initialFeatures = [
  { name: 'auth', isActive: false },
  { name: 'create-account', isActive: false }
]

const throw404 = (ctx, next) => { ctx.throw( 404, 'Endpoint not found' )}
const login = (ctx, next) => { /*... login logic */ }

const createKOAHandler = configureKOAHandler({ initialFeatures })
const featureOr404Handler = createKOAHandler(throw404)
const authFeatureOr404Handler = featureOr404Handler('auth')
const loginHandler = authFeatureOr404Handler(login)

app.post('/login', loginHandler)
```

#### Compose multiple feature toggle handlers together

```js
import { configureKOAHandler } from 'feature-toggles'
import { pipe } from 'ramda'

const initialFeatures = [
  { name: 'foo', isActive: false },
  { name: 'create-account', isActive: false }
]

const throw404 = (ctx, next) => { ctx.throw( 404, 'Endpoint not found' )}
const login = (ctx, next) => { /*... login logic */ }

const createKOAHandler = configureKOAHandler({ initialFeatures })
const featureOr404Handler = createKOAHandler(throw404)
const fooFeatureOr404Handler = featureOr404Handler('foo')
const barFeatureOr404Handler = featureOr404Handler('bar')
const bazFeatureOr404Handler = featureOr404Handler('baz')

const requiredFeaturesOr404 = pipe(fooFeatureOr404Handler, barFeatureOr404Handler, bazFeatureOr404Handler)

const loginHandler = requiredFeaturesOr404(login)

app.post('/login', loginHandler)
```

