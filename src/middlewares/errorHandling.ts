export const errorHandling = () => async (ctx: any, next: any) => {
  try {
    await next()
  } catch (err) {
    ctx.status = err.status
    ctx.message = err.message
  }
}
