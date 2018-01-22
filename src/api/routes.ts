import * as KoaRouter from 'koa-router'

import { Route, Method } from '../utils/Route/Route'
import { Path } from './Path'

import { authorization } from '../middlewares/authorization'
import { requireEmailVerified } from '../middlewares/requireEmailVerified'
import { ChangePassword } from './accounts/ChangePassword'
import { CreateAccount } from './accounts/CreateAccount'
import { ForgotPassword } from './accounts/ForgotPassword'
import { Login } from './accounts/Login'
import { VerifyAccount } from './accounts/Verify'
import { VerifyAccountToken } from './accounts/VerifyToken'
import { GetToken } from './tokens/GetToken'
import { CreateWork } from './works/CreateWork'
import { GetWork } from './works/GetWork'
import { GetWorks } from './works/GetWorks'

const router = new KoaRouter()
const route = new Route(router)

router.use(
  [
    Path.ACCOUNTS_VERIFY_TOKEN,
    Path.ACCOUNTS_VERIFY,
    Path.PASSWORD_CHANGE,
    Path.WORKS,
    Path.WORKS_WORKID,
    Path.TOKENS
  ],
  authorization()
)

router.use(
  [Path.WORKS, Path.WORKS_WORKID, Path.PASSWORD_CHANGE, Path.WORKS_WORKID],
  requireEmailVerified()
)

route.set(Method.POST, Path.ACCOUNTS, new CreateAccount())
route.set(Method.POST, Path.ACCOUNTS_VERIFY, new VerifyAccount())
route.set(Method.GET, Path.ACCOUNTS_VERIFY_TOKEN, new VerifyAccountToken())
route.set(Method.POST, Path.LOGIN, new Login())
route.set(Method.POST, Path.PASSWORD_RESET, new ForgotPassword())
route.set(Method.POST, Path.PASSWORD_CHANGE, new ChangePassword())
route.set(Method.POST, Path.WORKS, new CreateWork())
route.set(Method.GET, Path.WORKS, new GetWorks())
route.set(Method.GET, Path.WORKS_WORKID, new GetWork())
route.set(Method.GET, Path.TOKENS, new GetToken())

export const routes = router
