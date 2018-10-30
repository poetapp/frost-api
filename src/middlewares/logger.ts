import * as Pino from 'pino'

export const logger = (logger: (dirname: string) => Pino.Logger) => async (
  context: any,
  next: () => Promise<any>,
) => {
  context.logger = logger
  await next()
}
