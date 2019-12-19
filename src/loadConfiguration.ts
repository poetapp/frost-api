import { fromPairs, map, pipe, keys } from 'ramda'
import { configuration, Configuration, defaultMongodbUrl } from './configuration'

const toPair = (s: string) => [camelCaseToScreamingSnakeCase(s), s]

export const createEnvToConfigurationKeyMap: (keys: ReadonlyArray<string>) => { [index: string]: string } = pipe(
  map(toPair),
  fromPairs,
)

export const camelCaseToScreamingSnakeCase = (camelCase: string = '') =>
  camelCase.replace(/([A-Z])/g, capital => '_' + capital).toUpperCase()

export const guessValueType = (value: unknown) =>
  typeof value !== 'string' ? value :
  value === 'true' ? true :
  value === 'false' ? false :
  Number.isNaN(parseInt(value, 10)) ? value :
  value.startsWith('0x') ? value :
  parseInt(value, 10)

const loadConfigurationFromEnv = (env: any): Partial<Configuration> => {
  const map = createEnvToConfigurationKeyMap(keys(configuration))

  const configurationFromEnv = Object.entries(env)
    .filter(([key, value]) => map[key])
    .reduce(
      (previousValue, [key, value]: [string, any]) => ({
        ...previousValue,
        [map[key]]: guessValueType(value),
      }),
      {},
    )

  return configurationFromEnv
}

export const mergeConfigs = (localVars: any = {}) => {
  const config = {
    ...configuration,
    ...loadConfigurationFromEnv(localVars),
  }

  // Support setting MONGODB_URL all at once or via separate variables.
  if (config.mongodbUrl === defaultMongodbUrl) {
    const mongoAuth = config.mongodbUser !== '' ? `${config.mongodbUser}:${config.mongodbPassword}@` : ''
    config.mongodbUrl = [
      config.mongodbSchema,
      '://',
      mongoAuth,
      config.mongodbHost,
      ':',
      config.mongodbPort,
      '/',
      config.mongodbDatabase,
    ]
    .join('')
  }

  return config
}

export const loadConfigurationWithDefaults = (localVars: any = {}) =>
  pipe(mergeConfigs)({ ...process.env, ...localVars })
