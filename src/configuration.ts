export const envMerge = (env: any) => ({
  vaultToken: env.VAULT_TOKEN || undefined,
  vaultUrl: env.VAULT_URL || 'http://localhost:8200',
  mongodbUrl: env.MONGODB_URL || 'mongodb://localhost:27017/frost',
  redisPort: env.REDIS_PORT ? parseInt(env.REDIS_PORT, 10) : 6379,
  redisHost: env.REDIS_HOST || 'localhost',
  poetUrl: env.POET_URL || 'http://localhost:18080',
  frostUrl: env.FROST_URL || 'http://localhost:3000',
  frostVerifiedAccount: env.FROST_VERIFIED_ACCOUNT || '',
  frostChangePassword: env.FROST_CHANGE_PASSWORD || '',
  transactionalMandrill: env.TRANSACTIONAL_MANDRILL || '***REMOVED***',
  jwt: env.JWT || '***REMOVED***',
  verifiedAccount: env.VERIFIED_ACCOUNT === 'true' ? true : false,
  emailReply: env.EMAIL_REPLY || 'contact@po.et',
  emailFrom: env.EMAIL_FROM || 'Po.et',
  sendEmailDisabled: env.SEND_EMAIL_DISABLED === 'true' ? true : false,
  emailTransportMailDev: env.EMAIL_TRANSPORT_MAIL_DEV === 'true' ? true : false,
  maxApiTokens: env.MAX_API_TOKENS ? parseInt(env.MAX_API_TOKENS, 10) : 5,
  maxApiRequestLimitForm: env.MAX_API_REQUEST_LIMIT_FORM || '500kb',
  maxApiRequestLimitJson: env.MAX_API_REQUEST_LIMIT_JSON || '500kb',
  passwordComplex: {
    min: 10,
    max: 30,
    lowerCase: 1,
    upperCase: 1,
    numeric: 1,
    symbol: 1,
  },
  pwnedCheckerRoot: env.PWNEDCHECKER_ROOT || '',
  rateLimitDisabled: env.RATE_LIMIT_DISABLED === 'true' ? true : false,
  loginRateLimitMax: env.LOGIN_RATE_LIMIT_MAX ? parseInt(env.LOGIN_RATE_LIMIT_MAX, 10) : 1000,
  accountRateLimitMax: env.ACCOUNT_RATE_LIMIT_MAX ? parseInt(env.ACCOUNT_RATE_LIMIT_MAX, 10) : 1000,
  passwordChangeRateLimitMax: env.PASSWORD_CHANGE_RATE_LIMIT_MAX
    ? parseInt(env.PASSWORD_CHANGE_RATE_LIMIT_MAX, 10)
    : 1000,
  loginRateLimitDuration: env.LOGIN_RATE_LIMIT_DURATION ? parseInt(env.LOGIN_RATE_LIMIT_DURATION, 10) : 3600000,
  accountRateLimitDuration: env.ACCOUNT_RATE_LIMIT_DURATION ? parseInt(env.ACCOUNT_RATE_LIMIT_DURATION, 10) : 3600000,
  passwordChangeRateLimitDuration: env.PASSWORD_CHANGE_RATE_LIMIT_DURATION
    ? parseInt(env.PASSWORD_CHANGE_RATE_LIMIT_DURATION, 10)
    : 3600000,
})

export const configuration = envMerge(process.env)
