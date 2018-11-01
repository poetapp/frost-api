export const addHeaderToError = () => async (ctx: any, next: any) => {
  try {
    await next()
  } catch (err) {
    ctx.set('Access-Control-Allow-Origin', '*')
    ctx.status = err.status
    ctx.message = err.message
  }
}
