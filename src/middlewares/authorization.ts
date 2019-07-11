export const Authorization = () => async (ctx: any, next: any) => {
  // TODO: add configuration to ctx in app.ts so middlewares have access.
  // This is needed until we can figure out how to restart vault between
  // individual tests.
  // Currently a hack used to prevent errors in integration tests.
  if (process.env.SKIP_VAULT === 'true') return (ctx.status = 404)

  const { user } = ctx.state

  if (!user) return (ctx.status = 404)

  return next()
}
