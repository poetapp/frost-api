import * as KoaRouter from 'koa-router'

import { Route, Method } from 'Route'
import { Path } from './Path'

import { authorization } from '../middlewares/authorization'
import { requireEmailVerified } from '../middlewares/requireEmailVerified'
import { ChangePassword } from './accounts/ChangePassword'
import { CreateAccount } from './accounts/CreateAccount'
import { ForgotPassword } from './accounts/ForgotPassword'
import { Login } from './accounts/Login'
import { VerifyAccount } from './accounts/Verify'
import { VerifyAccountToken } from './accounts/VerifyToken'
import { CreateWork } from './works/CreateWork'
import { GetWork } from './works/GetWork'

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
  [Path.WORK, Path.WORK_WORKID, Path.PASSWORD_CHANGE, Path.WORK_WORKID],
  requireEmailVerified()
)

route.set(Method.POST, Path.ACCOUNT, new CreateAccount())
route.set(Method.POST, Path.ACCOUNT_VERIFY, new VerifyAccount())
route.set(Method.GET, Path.ACCOUNT_VERIFY_TOKEN, new VerifyAccountToken())
route.set(Method.POST, Path.LOGIN, new Login())
route.set(Method.POST, Path.PASSWORD_RESET, new ForgotPassword())
route.set(Method.POST, Path.PASSWORD_CHANGE, new ChangePassword())
route.set(Method.POST, Path.WORK, new CreateWork())
route.set(Method.GET, Path.WORK_WORKID, new GetWork())

export const routes = router
