import { Context } from 'koa'

export const GetHealth = () => (ctx: Context, next: any): any => {
  ctx.status = 200
}
