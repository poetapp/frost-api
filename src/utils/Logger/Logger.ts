const { createLogger, format, transports } = require('winston')
const { combine, timestamp, splat, simple } = format

export const logger = createLogger({
  format: combine(timestamp(), simple(), splat()),
  transports: [
    // - Write to all logs with level `info` and below to `combined.log`
    // - Write all logs error (and below) to `error.log`.
    new transports.Console(),
    new transports.File({ filename: 'error.log', level: 'error' }),
    new transports.File({ filename: 'combined.log' })
  ]
})
