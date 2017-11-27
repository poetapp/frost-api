import * as KoaRouter from 'koa-router'

import { Route, Method } from './../modules/Route/Route'
import { Path } from './Path'
import { authorization } from './middlewares/authorization'
import { requireEmailVerified } from './middlewares/requireEmailVerified'

import { ChangePassword } from './accounts/changePassword/changePassword'
import { CreateAccount } from './accounts/create/create'
import { ForgotPassword } from './accounts/forgotPassword/forgotPassword'
import { Login } from './accounts/login/login'
import { VerifyAccount } from './accounts/verify/verify'
import { VerifyAccountToken } from './accounts/verifyToken/verifyToken'
import { GetWork } from './works/GetWork'
import { Work } from './works/works'

const router = new KoaRouter()
const route = new Route(router)

router.use(
  [
    Path.ACCOUNT_VERIFY_TOKEN,
    Path.PASSWORD_CHANGE,
    Path.WORK,
    Path.WORK_WORKID
  ],
  authorization()
)

router.use(
  [Path.WORK, Path.WORK_WORKID, Path.PASSWORD_CHANGE],
  requireEmailVerified()
)

route.set(Method.POST, Path.ACCOUNT, new CreateAccount())
route.set(Method.POST, Path.ACCOUNT_VERIFY, new VerifyAccount())
route.set(Method.GET, Path.ACCOUNT_VERIFY_TOKEN, new VerifyAccountToken())
route.set(Method.POST, Path.LOGIN, new Login())
route.set(Method.POST, Path.PASSWORD_RESET, new ForgotPassword())
route.set(Method.POST, Path.PASSWORD_CHANGE, new ChangePassword())
route.set(Method.POST, Path.WORK, new Work())
route.set(Method.GET, Path.WORK_WORKID, new GetWork())

export const routes = router
