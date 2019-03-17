import * as fs from 'fs'
import { homedir } from 'os'
import * as path from 'path'
import * as Pino from 'pino'
import { promisify } from 'util'

import { Configuration } from './configuration'
import { loadConfigurationWithDefaults } from './loadConfiguration'
import { delay } from './utils/Delay/Delay'
import { loggingConfigurationToPinoConfiguration } from './utils/Logging/Logging'
import { Vault } from './utils/Vault/Vault'

const readFile = promisify(fs.readFile)
const VAULT_FILE = path.join(homedir(), '/.po.et/vault.json')

export const initVault = async () => {
  const configuration: Configuration = loadConfigurationWithDefaults()
  const logger = Pino(loggingConfigurationToPinoConfiguration(configuration))

  logger.info('Attempting to initialize Vault.')
  const config = await initializeWithRetries(logger)
  logger.info(config, 'Vault configuration obtained.')

  if (!config) {
    logger.fatal(
      `Vault was initialized. Check file ${VAULT_FILE} in the container. \
       You have to set the environment variable VAULT_TOKEN.`,
    )
    return
  }

  const { keys, root_token } = config
  const vault = Vault.getInstance()
  vault.token = root_token

  await unsealWithRetries(logger, keys[0])
  await waitWhileVaultIsInStandby(logger)

  await Vault.mountTransit()
  await Vault.writeTransitKey()

  const frostSecrets = {
    transactionalMandrill: configuration.transactionalMandrill,
    jwt: configuration.jwt,
  }

  await Vault.writeSecret('frost', frostSecrets)
}

const initializeWithRetries = async (logger: Pino.Logger) => {
  let config: any
  let status: any = null

  while (!status || !status.initialized) {
    try {
      status = await Vault.status()
      if (!status.initialized) {
        config = await Vault.init()
        logger.info('Vault initialized successfully.')
        fs.writeFileSync(VAULT_FILE, JSON.stringify(config, null, '\t'))
        logger.info({ config, VAULT_FILE }, 'Vault configuration written to disk.')
      } else {
        logger.info('Vault was already initialized. Reading Vault configuration from disk.')
        config = JSON.parse(await readFile(VAULT_FILE, 'utf8'))
      }
    } catch (error) {
      logger.info({ error }, 'Error while initializing Vault. Will retry in 5 seconds.')
      await delay(5000)
    }

    status = await Vault.status()
  }

  return config
}

const waitWhileVaultIsInStandby = async (logger: Pino.Logger) => {
  while (true) {
    const status = await Vault.status()
    if (!status.standby) return
    logger.info('Vault is in standby. Will retry in 5 seconds.')
    await delay(5000)
  }
}

const unsealWithRetries = async (logger: Pino.Logger, key: string) => {
  while (true)
    try {
      const status = await Vault.status()
      if (!status.sealed) {
        logger.info('Vault was already unsealed.')
        return
      }
      logger.info('Attempting to unseal Vault.')
      await Vault.unseal(key)
      logger.info('Vault unsealed successfully.')
      return
    } catch (e) {
      logger.error(e, 'Error unsealing Vault. Will retry in 5 seconds.')
      await delay(5000)
    }
}
