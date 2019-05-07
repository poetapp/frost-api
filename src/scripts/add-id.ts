import { MongoClient } from 'mongodb'
import * as Pino from 'pino'

import { Configuration } from '../configuration'
import { AccountDao } from '../daos/AccountDao'
import { uuid4 } from '../helpers/uuid'
import { loadConfigurationWithDefaults } from '../loadConfiguration'
import { loggingConfigurationToPinoConfiguration } from '../utils/Logging/Logging'

async function addId() {
  const configuration: Configuration = loadConfigurationWithDefaults()
  const logger = Pino(loggingConfigurationToPinoConfiguration(configuration))

  logger.info('Running Frost API — Add Account.id')
  logger.info(configuration, 'Configuration')

  const mongoClient = await MongoClient.connect(configuration.mongodbUrl)
  const dbConnection = await mongoClient.db()
  const accountCollection = dbConnection.collection('accounts')
  const accountDao = AccountDao(accountCollection)

  const getUnusedId = async (): Promise<string> => {
    const id = uuid4()
    const account = await accountDao.findOne({ id })
    return !account ? id : getUnusedId()
  }

  const query = { id: { $exists: false } }

  const accounts = await accountCollection.find(query).toArray()

  logger.info({ count: accounts.length, emails: accounts.map(_ => _.email) }, 'Found accounts without Id.')

  for (const account of accounts) {
    const id = await getUnusedId()
    await accountCollection.updateOne({ _id: account._id }, { $set: { id } })
    logger.info({ id, email: account.email, _id: account._id }, 'Updated account!')
  }

  logger.info('Finished adding Ids.')

  await mongoClient.close()

  logger.info('Finished everything!')

}

// tslint:disable: no-console
addId().catch(console.error)
