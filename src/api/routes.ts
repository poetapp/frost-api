import * as KoaRouter from 'koa-router'

import { Route, Method } from '../utils/Route/Route'
import { Path } from './Path'

import { authorization } from '../middlewares/authorization'
import { isLoggedIn } from '../middlewares/isLoggedIn'
import { requireEmailVerified } from '../middlewares/requireEmailVerified'
import { CreateAccount } from './accounts/CreateAccount'
import { ForgotPassword } from './accounts/ForgotPassword'
import { GetProfile } from './accounts/GetProfile'
import { Login } from './accounts/Login'
import { PasswordChange } from './accounts/PasswordChange'
import { PasswordChangeToken } from './accounts/PasswordChangeToken'
import { VerifyAccount } from './accounts/Verify'
import { VerifyAccountToken } from './accounts/VerifyToken'
import { CreateToken } from './tokens/CreateToken'
import { GetToken } from './tokens/GetToken'
import { CreateWork } from './works/CreateWork'
import { GetWork } from './works/GetWork'
import { GetWorks } from './works/GetWorks'

const router = new KoaRouter()
const route = new Route(router)

router.use([Path.WORKS, Path.WORKS_WORKID], (ctx: any, next: any) => {
  ctx.set('Access-Control-Allow-Methods', 'POST,GET')
  ctx.set('Access-Control-Allow-Headers', 'Content-Type,token')

  return next()
})

router.use(
  [
    Path.ACCOUNTS_VERIFY_TOKEN,
    Path.ACCOUNTS_VERIFY,
    Path.PASSWORD_CHANGE,
    Path.WORKS,
    Path.WORKS_WORKID,
    Path.TOKENS,
    Path.ACCOUNTS_PROFILE,
    Path.PASSWORD_CHANGE_TOKEN
  ],
  authorization()
)

router.use(
  [Path.WORKS, Path.WORKS_WORKID, Path.PASSWORD_CHANGE, Path.WORKS_WORKID],
  requireEmailVerified()
)

router.use([Path.TOKENS], isLoggedIn())

route.set(Method.POST, Path.ACCOUNTS, new CreateAccount())
route.set(Method.GET, Path.ACCOUNTS_PROFILE, new GetProfile())
route.set(Method.POST, Path.ACCOUNTS_VERIFY, new VerifyAccount())
route.set(Method.GET, Path.ACCOUNTS_VERIFY_TOKEN, new VerifyAccountToken())
route.set(Method.POST, Path.LOGIN, new Login())
route.set(Method.POST, Path.PASSWORD_RESET, new ForgotPassword())
route.set(Method.POST, Path.PASSWORD_CHANGE_TOKEN, new PasswordChangeToken())
route.set(Method.POST, Path.PASSWORD_CHANGE, new PasswordChange())
route.set(Method.POST, Path.WORKS, new CreateWork())
route.set(Method.GET, Path.WORKS, new GetWorks())
route.set(Method.GET, Path.WORKS_WORKID, new GetWork())
route.set(Method.GET, Path.TOKENS, new GetToken())
route.set(Method.POST, Path.TOKENS, new CreateToken())

export const routes = router
