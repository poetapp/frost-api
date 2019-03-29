export const errorHandling = () => async (ctx: any, next: any) => {
  try {
    await next()
  } catch (err) {
    if (Number.isInteger(err.status)) {
      ctx.status = err.status
      ctx.body = err.message
    } else {
      const logger = ctx.logger('Error Middleware')
      logger.error(err)
      ctx.status = 500
    }
  }
}
