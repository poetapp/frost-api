import * as Koa from 'koa'
import { logger } from '../utils/Logger/Logger'
const { map, lensPath, ifElse, compose, view, set, identity } = require('ramda')

export const omitSecretsInUrl = (secrets: ReadonlyArray<string> = [], url: string = '') => {
  return secrets.length ? url.replace(new RegExp(secrets.join('|'), 'g'), '[secure]') : url
}

const getValuesOfSecrets = (
  keys: ReadonlyArray<string>,
  params: { [index: string]: string },
  query: { [index: string]: string },
  body: { [index: string]: string },
  headers: { [index: string]: string },
): ReadonlyArray<string> =>
  // prettier-ignore
  [
    ...Object.entries(params),
    ...Object.entries(query),
    ...Object.entries(body),
    ...Object.entries(headers),
  ]
  .filter(([key, value]) => keys.includes(key))
  .map(([key, value]) => value)

const collectDataForLogging = (secrets: ReadonlyArray<string>) => (ctx: Koa.Context) => {
  const {
    method,
    url,
    headers,
    query,
    params,
    request: { body },
  } = ctx

  const valuesOfSecrets = getValuesOfSecrets(secrets, params, query, body, headers)

  return {
    method,
    url: omitSecretsInUrl(valuesOfSecrets, url),
    headers,
    query,
    params,
    body,
  }
}

const secureText = (lens: () => {}) => ifElse(view(lens), set(lens, '[secure]'), identity)

const getHeadersLens = (secret = '') => lensPath(['headers', secret])
const getQueryLens = (secret = '') => lensPath(['query', secret])
const getParamsLens = (secret = '') => lensPath(['params', secret])
const getBodyLens = (secret = '') => lensPath(['body', secret])

export const secureSecrets = (secrets: ReadonlyArray<string>) =>
  compose(
    ...map(secureText, map(getBodyLens, secrets)),
    ...map(secureText, map(getParamsLens, secrets)),
    ...map(secureText, map(getQueryLens, secrets)),
    ...map(secureText, map(getHeadersLens, secrets)),
    collectDataForLogging(secrets),
  )

export const monitor = (secrets: ReadonlyArray<string> = []) => {
  return (ctx: Koa.Context, next: () => void) => {
    logger.info({
      monitor: secureSecrets(secrets)(ctx),
    })

    return next()
  }
}
