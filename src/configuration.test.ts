import { describe } from 'riteway'
import { envMerge } from './configuration'

describe('envMerge', async (should: any) => {
  const { assert } = should()

  {
    const envOverrides = {
      VAULT_TOKEN: 'vault token',
      VAULT_URL: 'vault url',
      MONGODB_URL: 'mongodb_url',
      REDIS_PORT: '199',
      REDIS_HOST: 'redis',
      POET_URL: 'poet url',
      FROST_URL: 'frost url',
      FROST_VERIFIED_ACCOUNT: 'frost verified account',
      FROST_CHANGE_PASSWORD: 'frost change password',
      TRANSACTIONAL_MANDRILL: 'transactional mandrill',
      JWT: 'jwt',
      VERIFIED_ACCOUNT: 'true',
      EMAIL_REPLY: 'email reply',
      EMAIL_FROM: 'email from',
      SEND_EMAIL_DISABLED: 'true',
      EMAIL_TRANSPORT_MAIL_DEV: 'true',
      MAX_API_TOKENS: '999',
      MAX_API_REQUEST_LIMIT_FORM: 'max api request limit form',
      MAX_API_REQUEST_LIMIT_JSON: 'max api request limit json',
      PWNEDCHECKER_ROOT: 'pwned checker root',
      RATE_LIMIT_DISABLED: 'true',
      LOGIN_RATE_LIMIT_MAX: 199,
      ACCOUNT_RATE_LIMIT_MAX: 199,
      PASSWORD_CHANGE_RATE_LIMIT_MAX: 199,
      LOGIN_RATE_LIMIT_DURATION: 199,
      ACCOUNT_RATE_LIMIT_DURATION: 199,
      PASSWORD_CHANGE_RATE_LIMIT_DURATION: 199,
    }

    const expected = {
      vaultToken: 'vault token',
      vaultUrl: 'vault url',
      mongodbUrl: 'mongodb_url',
      redisPort: 199,
      redisHost: 'redis',
      poetUrl: 'poet url',
      frostUrl: 'frost url',
      frostVerifiedAccount: 'frost verified account',
      frostChangePassword: 'frost change password',
      transactionalMandrill: 'transactional mandrill',
      jwt: 'jwt',
      verifiedAccount: true,
      emailReply: 'email reply',
      emailFrom: 'email from',
      sendEmailDisabled: true,
      emailTransportMailDev: true,
      maxApiTokens: 999,
      maxApiRequestLimitForm: 'max api request limit form',
      maxApiRequestLimitJson: 'max api request limit json',
      passwordComplex: { min: 10, max: 30, lowerCase: 1, upperCase: 1, numeric: 1, symbol: 1 },
      pwnedCheckerRoot: 'pwned checker root',
      rateLimitDisabled: true,
      loginRateLimitMax: 199,
      accountRateLimitMax: 199,
      passwordChangeRateLimitMax: 199,
      loginRateLimitDuration: 199,
      accountRateLimitDuration: 199,
      passwordChangeRateLimitDuration: 199,
    }

    assert({
      given: 'an object with configuration environment variable names as properties',
      should: 'return an object with the override values instead of the default values',
      actual: envMerge(envOverrides),
      expected,
    })
  }

  {
    const expected = {
      vaultUrl: 'http://localhost:8200',
      mongodbUrl: 'mongodb://localhost:27017/frost',
      redisPort: 6379,
      redisHost: 'localhost',
      poetUrl: 'http://localhost:18080',
      frostUrl: 'http://localhost:3000',
      frostVerifiedAccount: '',
      frostChangePassword: '',
      transactionalMandrill: '46mwv_E6dOxrSDUkJD4NOQ',
      jwt: '2cff77d8f0a411e78c3f9a214cf093ae',
      verifiedAccount: false,
      emailReply: 'contact@po.et',
      emailFrom: 'Po.et',
      sendEmailDisabled: false,
      emailTransportMailDev: false,
      maxApiTokens: 5,
      maxApiRequestLimitForm: '500kb',
      maxApiRequestLimitJson: '500kb',
      passwordComplex: { min: 10, max: 30, lowerCase: 1, upperCase: 1, numeric: 1, symbol: 1 },
      pwnedCheckerRoot: '',
      rateLimitDisabled: false,
      loginRateLimitMax: 1000,
      accountRateLimitMax: 1000,
      passwordChangeRateLimitMax: 1000,
      loginRateLimitDuration: 3600000,
      accountRateLimitDuration: 3600000,
      passwordChangeRateLimitDuration: 3600000,
    }

    assert({
      given: 'an object with no configuration environment variable names',
      should: 'return the default configuration',
      actual: envMerge({ FOO: 1 }),
      expected: { ...expected, vaultToken: undefined },
    })
  }
})
