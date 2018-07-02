import * as KoaRouter from 'koa-router'

import { Path } from './Path'

import { authorization } from '../middlewares/authorization'
import { isLoggedIn } from '../middlewares/isLoggedIn'
import { requireEmailVerified } from '../middlewares/requireEmailVerified'
import { validate } from '../middlewares/validate'

import { CreateAccount, CreateAccountSchema } from './accounts/CreateAccount'
import { ForgotPassword, ForgotPasswordSchema } from './accounts/ForgotPassword'
import { GetProfile } from './accounts/GetProfile'
import { Login, LoginSchema } from './accounts/Login'
import { PasswordChange, PasswordChangeSchema } from './accounts/PasswordChange'
import { PasswordChangeToken, PasswordChangeTokenSchema } from './accounts/PasswordChangeToken'
import { VerifyAccount } from './accounts/Verify'
import { VerifyAccountToken } from './accounts/VerifyToken'

import { CreateToken } from './tokens/CreateToken'
import { GetToken } from './tokens/GetToken'
import { RemoveToken, RemoveTokenSchema } from './tokens/RemoveToken'

import { CreateWork, CreateWorkSchema } from './works/CreateWork'
import { GetWork, GetWorkSchema } from './works/GetWork'
import { GetWorks } from './works/GetWorks'

const router = new KoaRouter()

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
    Path.PASSWORD_CHANGE_TOKEN,
    Path.TOKENS_TOKENID,
  ],
  authorization()
)

router.use([Path.WORKS, Path.WORKS_WORKID, Path.PASSWORD_CHANGE, Path.WORKS_WORKID], requireEmailVerified())

router.use([Path.TOKENS], isLoggedIn())

router.post(Path.ACCOUNTS, validate({ body: CreateAccountSchema }), CreateAccount())
router.post(Path.PASSWORD_RESET, validate({ body: ForgotPasswordSchema }), ForgotPassword())
router.get(Path.ACCOUNTS_PROFILE, GetProfile())
router.post(Path.LOGIN, validate({ body: LoginSchema }), Login())
router.post(Path.PASSWORD_CHANGE, validate({ body: PasswordChangeSchema }), PasswordChange())
router.post(Path.PASSWORD_CHANGE_TOKEN, validate({ body: PasswordChangeTokenSchema }), PasswordChangeToken())
router.post(Path.ACCOUNTS_VERIFY, VerifyAccount())
router.get(Path.ACCOUNTS_VERIFY_TOKEN, VerifyAccountToken())

router.post(Path.TOKENS, CreateToken())
router.get(Path.TOKENS, GetToken())
router.del(Path.TOKENS_TOKENID, validate({ params: RemoveTokenSchema }), RemoveToken())

router.post(Path.WORKS, validate({ body: CreateWorkSchema, options: { allowUnknown: true } }), CreateWork())
router.get(Path.WORKS_WORKID, validate({ params: GetWorkSchema }), GetWork())
router.get(Path.WORKS, GetWorks())

export const routes = router
