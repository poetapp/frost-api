import * as Router from 'koa-router'
import User from './modules/Users/User'

const router = new Router()

router.post('/users', async (ctx, next) => {
  const user = ctx.request.body
  const response = await User.create(user)
  ctx.body = response
})

export default router
