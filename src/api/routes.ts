import * as KoaRouter from 'koa-router'
import { authorization } from './middlewares/authorization'
import { Work } from './works/works'

import { ChangePassword } from './accounts/changePassword/changePassword'
import { CreateAccount } from './accounts/create/create'
import { ForgotPassword } from './accounts/forgotPassword/forgotPassword'
import { Login } from './accounts/login/login'

import { Route } from './Route'

const router = new KoaRouter()
const omitPaths = ['account', 'login', 'password/forgot']

router.use(authorization(omitPaths))

const route = new Route(router)
route.set('post', '/account', new CreateAccount())
route.set('post', '/login', new Login())
route.set('post', '/password/forgot', new ForgotPassword())
route.set('post', '/password/change', new ChangePassword())
route.set('post', '/work', new Work())

export const routes = router
