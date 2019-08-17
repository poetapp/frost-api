export const Authorization = () => async (ctx: any, next: any) => {
  if (process.env.SKIP_VAULT === 'true') return (ctx.status = 404)

  const { user } = ctx.state

  if (!user) return (ctx.status = 404)

  return next()
}
