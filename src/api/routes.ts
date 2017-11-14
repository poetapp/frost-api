import * as KoaRouter from 'koa-router'

import { Route, Method } from './../modules/Route/Route'
import { Path } from './Path'
import { authorization } from './middlewares/authorization'

import { ChangePassword } from './accounts/changePassword/changePassword'
import { CreateAccount } from './accounts/create/create'
import { ForgotPassword } from './accounts/forgotPassword/forgotPassword'
import { Login } from './accounts/login/login'
import { Work } from './works/works'

const router = new KoaRouter()
const route = new Route(router)

const omitPaths = [Path.ACCOUNT, Path.LOGIN, Path.PASSWORD_FORGOT]

router.use(authorization(omitPaths))

route.set(Method.POST, Path.ACCOUNT, new CreateAccount())
route.set(Method.POST, Path.LOGIN, new Login())
route.set(Method.POST, Path.PASSWORD_FORGOT, new ForgotPassword())
route.set(Method.POST, Path.PASSWORD_CHANGE, new ChangePassword())
route.set(Method.POST, Path.WORK, new Work())

export const routes = router
