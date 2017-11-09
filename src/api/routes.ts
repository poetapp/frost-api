import * as KoaRouter from 'koa-router'
import { createAccount, loginAccount } from './accounts/accounts'
import { authorization } from './middlewares/authorization'
import { createWork } from './works/works'

const router = new KoaRouter()
const omitPaths = ['users', 'login']

router.use(authorization(omitPaths))

router.post('/users', createAccount)
router.post('/login', loginAccount)
router.post('/work', createWork)

export const routes = router
