import * as KoaRouter from 'koa-router'
import {
  createAccount,
  loginAccount,
  recoverAccount,
  recoverAccountToken,
  validateAccount,
  validateRecoverAccount,
  validateRecoverAccountToken
} from './accounts/accounts'
import { authorization } from './middlewares/authorization'
import { createWork } from './works/works'

const router = new KoaRouter()
const omitPaths = ['users', 'login', 'recover-account', 'home']

router.use(authorization(omitPaths))

router.post('/users', validateAccount, createAccount)
router.post('/login', validateAccount, loginAccount)
router.post('/recover-account', validateRecoverAccount, recoverAccount)
router.post(
  '/recover-account-token',
  validateRecoverAccountToken,
  recoverAccountToken
)
router.post('/work', createWork)

export const routes = router
