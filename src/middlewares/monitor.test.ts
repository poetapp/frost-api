import { describe } from 'riteway'
import { secureSecrets, omitSecretsInUrl } from './monitor'

describe('monitor middleware', async (should: any) => {
  const { assert } = should('')
  const ctx = {
    method: 'post',
    url: 'url/123456',
    request: { body: { secret: '123456', value: '123456' } },
    params: { secret: '123456' },
    query: { secret: '123456' },
    headers: { secret: '123456' },
  }

  {
    const secrets = ['secret']
    const expected = {
      method: 'post',
      url: 'url/[secure]',
      headers: { secret: '[secure]' },
      query: { secret: '[secure]' },
      params: { secret: '[secure]' },
      body: { secret: '[secure]', value: '123456' },
    }

    assert({
      given: 'a Koa context and an array of secrets',
      should: 'change the secret key to [secure]',
      actual: secureSecrets(secrets)(ctx),
      expected,
    })
  }

  {
    const secrets = ['anykey']
    const expected = {
      method: 'post',
      url: 'url/123456',
      headers: { secret: '123456' },
      query: { secret: '123456' },
      params: { secret: '123456' },
      body: { secret: '123456', value: '123456' },
    }

    assert({
      given: 'secret key does not appear in the Koa context',
      should: 'not add this secret like new key',
      actual: secureSecrets(secrets)(ctx),
      expected,
    })
  }

  {
    const secrets = ['secret', 'another_secret']
    const newCtx = {
      ...ctx,
      headers: {
        ...ctx.headers,
        another_secret: '123456',
      },
    }

    const expected = {
      method: 'post',
      url: 'url/[secure]',
      headers: { secret: '[secure]', another_secret: '[secure]' },
      query: { secret: '[secure]' },
      params: { secret: '[secure]' },
      body: { secret: '[secure]', value: '123456' },
    }

    assert({
      given: 'several secret keys',
      should: 'replace all with [secure]',
      actual: secureSecrets(secrets)(newCtx),
      expected,
    })
  }

  {
    const secrets = [] as ReadonlyArray<string>
    const url = ''

    assert({
      given: 'any secret and empty url',
      should: 'return empty string',
      actual: omitSecretsInUrl(secrets, url),
      expected: '',
    })
  }

  {
    const secrets = ['TOKEN', 'PASSWORD']
    const url = 'api/TOKEN/PASSWORD/stuff'
    const expected = 'api/[secure]/[secure]/stuff'

    assert({
      given: 'secrets values and the a url that contain these secrets',
      should: 'replace in the url with [secure] where it matching with the values',
      actual: omitSecretsInUrl(secrets, url),
      expected,
    })
  }
})
