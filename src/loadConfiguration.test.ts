import { pick } from 'ramda'
import { describe } from 'riteway'
import { configuration } from './configuration'
import { mergeConfigs, loadConfigurationWithDefaults } from './loadConfiguration'

describe('mergeConfigs', async (assert: any) => {
  {
    const actual = mergeConfigs()
    const expected = configuration

    assert({
      given: 'no arguments',
      should: 'return the default config',
      actual,
      expected,
    })
  }

  {
    const stringOverride = { MONGODB_URL: 'one' }

    const actual = mergeConfigs(stringOverride)
    const expected = { ...configuration, mongodbUrl: 'one' }

    assert({
      given: 'a string override',
      should: 'return a config containing the string value',
      actual,
      expected,
    })
  }

  {
    const numberOverride = { MAX_API_TOKENS: 1 }

    const actual = mergeConfigs(numberOverride)
    const expected = { ...configuration, maxApiTokens: 1 }

    assert({
      given: 'a numerical value as a string override',
      should: 'return a config containing the numeric value',
      actual,
      expected,
    })
  }

  {
    const booleanOverride = { VERIFIED_ACCOUNT: true }

    const actual = mergeConfigs(booleanOverride)
    const expected = { ...configuration, verifiedAccount: true }

    assert({
      given: 'a boolean value as a string override',
      should: 'return a config containing the boolean value',
      actual,
      expected,
    })
  }

  {
    const overrideValues = {
      VAULT_TOKEN: 'override',
      VAULT_URL: 'override',
      MONGODB_URL: 'override',
      POET_URL: 'override',
      TEST_POET_URL: 'override',
      FROST_URL: 'override',
      FROST_VERIFIED_ACCOUNT: 'override',
      FROST_CHANGE_PASSWORD: 'override',
      VERIFIED_ACCOUNT: 'override',
      EMAIL_REPLY: 'override',
      EMAIL_FROM: 'override',
      SEND_EMAIL_DISABLED: 'override',
      EMAIL_TRANSPORT_MAIL_DEV: 'override',
      MAX_API_TOKENS: 'override',
      MAX_API_REQUEST_LIMIT_FORM: 'override',
      MAX_API_REQUEST_LIMIT_JSON: 'override',
      PASSWORD_COMPLEX_MIN: 'override',
      PASSWORD_COMPLEX_MAX: 'override',
      PASSWORD_COMPLEX_LOWER_CASE: 'override',
      PASSWORD_COMPLEX_UPPER_CASE: 'override',
      PASSWORD_COMPLEX_NUMERIC: 'override',
      PASSWORD_COMPLEX_SYMBOL: 'override',
      PWNED_CHECKER_ROOT: 'override',
      LOGGING_LEVEL: 'override',
      LOGGING_PRETTY: 'override',
    }

    const expected = {
      vaultToken: 'override',
      vaultUrl: 'override',
      mongodbUrl: 'override',
      poetUrl: 'override',
      testPoetUrl: 'override',
      frostUrl: 'override',
      frostVerifiedAccount: 'override',
      frostChangePassword: 'override',
      verifiedAccount: 'override',
      emailReply: 'override',
      emailFrom: 'override',
      sendEmailDisabled: 'override',
      emailTransportMailDev: 'override',
      maxApiTokens: 'override',
      maxApiRequestLimitForm: 'override',
      maxApiRequestLimitJson: 'override',
      passwordComplexMin: 'override',
      passwordComplexMax: 'override',
      passwordComplexLowerCase: 'override',
      passwordComplexUpperCase: 'override',
      passwordComplexNumeric: 'override',
      passwordComplexSymbol: 'override',
      pwnedCheckerRoot: 'override',
      loggingLevel: 'override',
      loggingPretty: 'override',
    }

    const keys = Object.keys(expected)
    const actual = pick(keys, mergeConfigs(overrideValues))

    assert({
      given: 'override default values',
      should: 'return the new config',
      actual,
      expected,
    })
  }
})

describe('loadConfigurationWithDefaults', async (assert: any) => {
  {
    const overrides = {
      VAULT_TOKEN: 'a123',
      VAULT_URL: 'abc',
    }

    const withoutLocalOverrides = loadConfigurationWithDefaults()

    const actual = loadConfigurationWithDefaults(overrides)
    const expected = { ...withoutLocalOverrides, vaultToken: 'a123', vaultUrl: 'abc' }

    assert({
      given: 'a local configuration override',
      should: 'return a config using the local override',
      actual,
      expected,
    })
  }
})
