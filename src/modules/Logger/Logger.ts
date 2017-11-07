import * as logger from 'winston'

logger.configure({
  level: 'info',
  transports: [
    // - Write to all logs with level `info` and below to `combined.log`
    // - Write all logs error (and below) to `error.log`.

    new logger.transports.File({ filename: 'error.log', level: 'error' }),
    new logger.transports.File({ filename: 'combined.log' })
  ]
})

export default logger
