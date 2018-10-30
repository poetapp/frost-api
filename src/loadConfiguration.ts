import { fromPairs, map, pipe, keys } from 'ramda'
import { configuration, Configuration } from './configuration'

const toPair = (s: string) => [camelCaseToScreamingSnakeCase(s), s]

export const createEnvToConfigurationKeyMap: (keys: ReadonlyArray<string>) => { [index: string]: string } = pipe(
  map(toPair),
  fromPairs,
)

export const camelCaseToScreamingSnakeCase = (camelCase: string = '') =>
  camelCase.replace(/([A-Z])/g, capital => '_' + capital).toUpperCase()

const extractValue = (value: any) => {
  const coercedValue = value === 'true' ? true : value === 'false' ? false : value

  return isNaN(coercedValue)
    ? coercedValue
    : typeof coercedValue === 'boolean'
      ? coercedValue
      : parseInt(coercedValue, 10)
}

const loadConfigurationFromEnv = (env: any): Partial<Configuration> => {
  const map = createEnvToConfigurationKeyMap(keys(configuration))

  const configurationFromEnv = Object.entries(env)
    .filter(([key, value]) => map[key])
    .reduce(
      (previousValue, [key, value]: [string, any]) => ({
        ...previousValue,
        [map[key]]: extractValue(value),
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

  return config
}

export const loadConfigurationWithDefaults = (localVars: any = {}) =>
  pipe(mergeConfigs)({ ...process.env, ...localVars })
