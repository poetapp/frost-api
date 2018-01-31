const { createLogger, format, transports } = require('winston')
const { combine, timestamp, splat, printf } = format

const customFormat = printf((info: any) => {
  return JSON.stringify(
    {
      timestamp: info.timestamp,
      level: info.level,
      type: info.type,
      message: info.message,
      stackTrace: info.stackTrace
    },
    null,
    2
  )
})

export const logger = createLogger({
  format: combine(timestamp(), splat(), customFormat),
  transports: [
    // - Write to all logs with level `info` and below to `combined.log`
    // - Write all logs error (and below) to `error.log`.
    new transports.Console(),
    new transports.File({ filename: 'error.log', level: 'error' }),
    new transports.File({ filename: 'combined.log' })
  ]
})

// Extend a winston
const originalLogError = logger.error
logger.error = function() {
  const args = Array.prototype.slice.call(arguments, 0)
  if (args.length >= 2 && args[1] instanceof Error)
    args[1].stackTrace = args[1].stack

  return originalLogError.apply(this, args)
}
