const {
  MONGODB_URL,
  FROST_URL,
  MAILDEV_URL,
  LOGIN_RATE_LIMIT_MAX,
  CREATE_ACCOUNT_RATE_LIMIT_MAX,
  PASSWORD_CHANGE_RATE_LIMIT_MAX,
  LOGIN_RATE_LIMIT_DURATION,
  CREATE_ACCOUNT_RATE_LIMIT_DURATION,
  PASSWORD_CHANGE_RATE_LIMIT_DURATION,
  RATE_LIMIT_DISABLED,
} = process.env

const email = 'test-ci@po.et'

const frostAccount = {
  email,
  password: 'aB%12345678910',
}

export const configuration = {
  mongodbUrl: MONGODB_URL || 'mongodb://localhost:27017/frost',
  frostUrl: FROST_URL || 'http://localhost:3000',
  maildevUrl: MAILDEV_URL || 'http://localhost:1080',
  frostAccount,
  rateLimitDisabled: RATE_LIMIT_DISABLED === 'true' ? true : false,
  loginRateLimitMax: LOGIN_RATE_LIMIT_MAX ? parseInt(LOGIN_RATE_LIMIT_MAX, 10) : 1000,
  createAccountRateLimitMax: CREATE_ACCOUNT_RATE_LIMIT_MAX ? parseInt(CREATE_ACCOUNT_RATE_LIMIT_MAX, 10) : 1000,
  passwordChangeRateLimitMax: PASSWORD_CHANGE_RATE_LIMIT_MAX ? parseInt(PASSWORD_CHANGE_RATE_LIMIT_MAX, 10) : 1000,
  loginRateLimitDuration: LOGIN_RATE_LIMIT_DURATION ? parseInt(LOGIN_RATE_LIMIT_DURATION, 10) : 3600000,
  createAccountRateLimitDuration: CREATE_ACCOUNT_RATE_LIMIT_DURATION
    ? parseInt(CREATE_ACCOUNT_RATE_LIMIT_DURATION, 10)
    : 3600000,
  passwordChangeRateLimitDuration: PASSWORD_CHANGE_RATE_LIMIT_DURATION
    ? parseInt(PASSWORD_CHANGE_RATE_LIMIT_DURATION, 10)
    : 3600000,
}
