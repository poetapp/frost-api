interface RateLimitConfiguration {
  readonly rateLimitDisabled: boolean
  readonly loginRateLimitMax: number
  readonly accountRateLimitMax: number
  readonly passwordChangeRateLimitMax: number
  readonly loginRateLimitDuration: number
  readonly accountRateLimitDuration: number
  readonly passwordChangeRateLimitDuration: number
}

interface RedisConfiguration {
  readonly redisPort: number
  readonly redisHost: string
}
interface MaxApiRequestLimitConfiguration {
  readonly maxApiRequestLimitForm: string
  readonly maxApiRequestLimitJson: string
}
export interface PasswordComplexConfiguration {
  readonly passwordComplexMin: number
  readonly passwordComplexMax: number
  readonly passwordComplexLowerCase: number
  readonly passwordComplexUpperCase: number
  readonly passwordComplexNumeric: number
  readonly passwordComplexSymbol: number
}

interface MongoDBConfiguration {
  readonly mongodbUrl: string
  readonly mongodbSocketTimeoutMS: number
  readonly mongodbKeepAlive: number
  readonly mongodbReconnectTries: number
  readonly mongodbUseNewUrlParser: boolean
}

interface MaildevConfiguration {
  readonly maildevPort25TcpAddr: string
  readonly maildevPort25TcpPort: number
  readonly maildevIgnoreTLS: boolean
}
export interface Configuration
  extends PasswordComplexConfiguration,
    MaxApiRequestLimitConfiguration,
    MongoDBConfiguration,
    MaildevConfiguration,
    RateLimitConfiguration,
    RedisConfiguration {
  readonly vaultToken: undefined
  readonly vaultUrl: string
  readonly vaultApiVersion: string
  readonly poetUrl: string
  readonly frostHost: string
  readonly frostUrl: string
  readonly frostPort: number
  readonly frostVerifiedAccount: string
  readonly frostChangePassword: string
  readonly verifiedAccount: boolean
  readonly emailReply: string
  readonly emailFrom: string
  readonly sendEmailDisabled: boolean
  readonly emailTransportMailDev: boolean
  readonly maxApiTokens: number
  readonly pwnedCheckerRoot: string
  readonly transactionalMandrill: string
  readonly jwt: string
}

export const configuration: Configuration = {
  vaultToken: undefined,
  vaultUrl: 'http://localhost:8200',
  vaultApiVersion: 'v1',
  mongodbUrl: 'mongodb://localhost:27017/frost',
  mongodbSocketTimeoutMS: 0,
  mongodbKeepAlive: 0,
  mongodbReconnectTries: 30,
  mongodbUseNewUrlParser: true,
  poetUrl: 'http://localhost:18080',
  frostHost: '0.0.0.0',
  frostPort: 3000,
  frostUrl: 'http://localhost:3000',
  frostVerifiedAccount: '',
  frostChangePassword: '',
  verifiedAccount: false,
  emailReply: 'contact@po.et',
  emailFrom: 'Po.et',
  sendEmailDisabled: false,
  emailTransportMailDev: false,
  maxApiTokens: 5,
  maxApiRequestLimitForm: '500kb',
  maxApiRequestLimitJson: '500kb',
  passwordComplexMin: 10,
  passwordComplexMax: 30,
  passwordComplexLowerCase: 1,
  passwordComplexUpperCase: 1,
  passwordComplexNumeric: 1,
  passwordComplexSymbol: 1,
  pwnedCheckerRoot: '',
  transactionalMandrill: '***REMOVED***',
  jwt: 'example',
  maildevPort25TcpAddr: 'localhost',
  maildevPort25TcpPort: 1025,
  maildevIgnoreTLS: true,
  redisPort: 6379,
  redisHost: 'localhost',
  rateLimitDisabled: true,
  loginRateLimitMax: 1000,
  accountRateLimitMax: 1000,
  passwordChangeRateLimitMax: 1000,
  loginRateLimitDuration: 3600000,
  accountRateLimitDuration: 3600000,
  passwordChangeRateLimitDuration: 3600000,
}
