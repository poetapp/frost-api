import { MiB } from './helpers/byteSizes'
import { LoggingConfiguration } from './utils/Logging/Logging'

export const defaultMongodbUrl = 'mongodb://localhost:27017/frost'

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
  readonly mongodbSchema: string
  readonly mongodbUser: string
  readonly mongodbPassword: string
  readonly mongodbHost: string
  readonly mongodbPort: number
  readonly mongodbDatabase: string
  readonly mongodbUrl: string
  readonly mongodbSocketTimeoutMS: number
  readonly mongodbKeepAlive: number
  readonly mongodbReconnectTries: number
  readonly mongodbUseNewUrlParser: boolean
}

interface MaildevConfiguration {
  readonly maildevPortTcpAddr: string
  readonly maildevPortTcpPort: number
  readonly maildevIgnoreTLS: boolean
}
export interface Configuration
  extends PasswordComplexConfiguration,
    MaxApiRequestLimitConfiguration,
    MongoDBConfiguration,
    MaildevConfiguration,
    LoggingConfiguration {
  readonly vaultToken: undefined
  readonly vaultUrl: string
  readonly vaultApiVersion: string
  readonly poetUrl: string
  readonly testPoetUrl: string
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
  readonly transactionalMandrill: string
  readonly jwt: string
  readonly skipVault: boolean
  readonly ethereumUrl: string
  readonly poeContractDecimals: number
  readonly poeContractAddress: string
  readonly poeBalanceMinimum: number
  readonly maximumFileSizeInBytes: number
  readonly privateKeyEncryptionKey: string
}

export const configuration: Configuration = {
  vaultToken: undefined,
  vaultUrl: 'http://localhost:8200',
  vaultApiVersion: 'v1',
  mongodbSchema: 'mongodb',
  mongodbUser: '',
  mongodbPassword: '',
  mongodbHost: 'localhost',
  mongodbPort: 27017,
  mongodbDatabase: 'frost',
  mongodbUrl: defaultMongodbUrl,
  mongodbSocketTimeoutMS: 0,
  mongodbKeepAlive: 0,
  mongodbReconnectTries: 30,
  mongodbUseNewUrlParser: true,
  poetUrl: 'http://localhost:18080',
  testPoetUrl: 'http://localhost:18080',
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
  skipVault: false,
  transactionalMandrill: '',
  jwt: 'example',
  maildevPortTcpAddr: 'localhost',
  maildevPortTcpPort: 1025,
  maildevIgnoreTLS: true,
  loggingLevel: 'info',
  loggingPretty: true,
  ethereumUrl: 'https://mainnet.infura.io/',
  poeContractAddress: '0x0e0989b1f9b8a38983c2ba8053269ca62ec9b195',
  poeContractDecimals: 8,
  poeBalanceMinimum: 1000,
  maximumFileSizeInBytes: MiB * 15,
  privateKeyEncryptionKey: '0000000000000000000000000000000000000000000000000000000000000000',
}
