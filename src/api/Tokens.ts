// Docs: https://www.vaultproject.io/api/auth/token/index.html
import { Network } from '../interfaces/Network'

export interface TokenOptions {
  readonly id?: string
  readonly role_name: string
  readonly policies: string[]
  readonly no_default_policy: boolean
  readonly renewable: boolean
  readonly ttl: string
  readonly display_name: string
  readonly num_uses: number
  readonly meta: { name: string; network?: string }
}

export namespace Token {
  export const Login: TokenOptions = {
    role_name: 'login',
    policies: ['login'],
    no_default_policy: true,
    renewable: false,
    ttl: '24h',
    display_name: 'Login',
    num_uses: 0, // The value of 0 has no limit to the number of uses.
    meta: {
      name: 'login',
    },
  }
  export const VerifyAccount: TokenOptions = {
    role_name: 'verify_account',
    policies: ['verify_account'],
    no_default_policy: true,
    renewable: false,
    ttl: '4611686018s', // ~146 years,
    display_name: 'Verify account',
    num_uses: 2,
    meta: {
      name: 'verify_account',
    },
  }
  export const ForgotPassword: TokenOptions = {
    role_name: 'forgot_password',
    policies: ['forgot_password'],
    no_default_policy: true,
    renewable: false,
    ttl: '30m',
    display_name: 'Forgot password',
    num_uses: 1,
    meta: {
      name: 'forgot_password',
    },
  }
  export const ApiKey: TokenOptions = {
    role_name: 'api_key',
    policies: ['api_key'],
    no_default_policy: true,
    renewable: true,
    ttl: '4611686018s', // ~146 years
    display_name: 'Api key',
    num_uses: 0, // The value of 0 has no limit to the number of uses.
    meta: {
      name: 'api_key',
      network: Network.LIVE,
    },
  }

  export const TestApiKey: TokenOptions = {
    role_name: 'test',
    policies: ['test_api_key'],
    no_default_policy: true,
    renewable: true,
    ttl: '4611686018s', // ~146 years
    display_name: 'Test Api key',
    num_uses: 0, // The value of 0 has no limit to the number of uses.
    meta: {
      name: 'test_api_key',
      network: Network.TEST,
    },
  }
}
