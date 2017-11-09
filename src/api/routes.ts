import * as KoaRouter from 'koa-router'
import {
  createAccount,
  loginAccount,
  validateAccount
} from './accounts/accounts'
import { authorization } from './middlewares/authorization'
import { createWork } from './works/works'

const router = new KoaRouter()
const omitPaths = ['users', 'login']

router.use(authorization(omitPaths))

router.post('/users', validateAccount, createAccount)
router.post('/login', validateAccount, loginAccount)
router.post('/work', createWork)

export const routes = router
