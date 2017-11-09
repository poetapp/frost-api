import * as KoaRouter from 'koa-router'
import { createAccount, loginAccount } from './accounts/accounts'
import { createWork } from './works/works'

const router = new KoaRouter()

router.post('/users', createAccount)
router.post('/login', loginAccount)
router.post('/work', createWork)

export const routes = router
