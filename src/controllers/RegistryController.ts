import * as Pino from 'pino'

import { AccountDao } from '../daos/AccountDao'
import { RegistryDao } from '../daos/RegistryDao'
import { EtherBalanceInsufficient, NoEthereumAccount, Unauthorized } from '../errors/errors'
import { EthereumRegistryContract } from '../helpers/EthereumRegistryContract'
import { uuid4 } from '../helpers/uuid'
import { Registry } from '../models/Registry'

export interface RegistryController {
  readonly create: (owner: string, address: string) => Promise<string>
  readonly getById: (id: string) => Promise<Registry>
  readonly getByOwner: (owner: string) => Promise<ReadonlyArray<Registry>>
  readonly addCid: (userId: string, registryId: string, cid: string) => Promise<void>
}

interface Dependencies {
  readonly logger: Pino.Logger
  readonly registryDao: RegistryDao
  readonly accountDao: AccountDao
}

interface Configuration {
  readonly ethereumUrl: string
  readonly ethereumChainId: number
  readonly cidPageSize?: number
}

interface Arguments {
  readonly dependencies: Dependencies
  readonly configuration: Configuration
}

export const RegistryController = ({
  dependencies: {
    logger,
    registryDao,
    accountDao,
  },
  configuration: {
    ethereumUrl,
    ethereumChainId,
    cidPageSize = 10,
  },
}: Arguments): RegistryController => {
  const getById = async (id: string) => {
    logger.info({ id }, 'Get Registry')
    const registry = await registryDao.findOne({ id })
    const ethereumRegistryContract = EthereumRegistryContract({
      rpcUrl: ethereumUrl,
      contractAddress: registry.address,
    })
    const cidCount = await ethereumRegistryContract.getCidCount()
    const cids = await ethereumRegistryContract.getCids(
      Math.max(0, cidCount - cidPageSize),
      Math.min(cidPageSize, cidCount),
    )
    return {
      ...registry,
      cidCount,
      cids,
    }
  }

  const getByOwner = async (ownerId: string) => {
    logger.info({ ownerId }, 'Get Registry')
    return registryDao.find({ ownerId })
  }

  const create = async (ownerId: string, address: string) => {
    logger.info({ ownerId, address }, 'Creating Registry')
    const id = await getUnusedId()
    await registryDao.insertOne({ id, ownerId, address })
    return id
  }

  const getUnusedId = async (): Promise<string> => {
    const id = uuid4()
    const account = await registryDao.findOne({ id })
    return !account ? id : getUnusedId()
  }

  const addCid = async (userId: string, registryId: string, cid: string) => {
    logger.debug({ registryId, cid }, 'Adding CID to registry')
    const registry = await registryDao.findOne({ id: registryId })

    if (registry.ownerId !== userId)
      throw new Unauthorized()

    const account = await accountDao.findOne({ id: userId })

    logger.trace({ registryId, cid, account }, 'Adding CID to registry')

    if (!account.ethereumRegistryPrivateKey)
      throw new NoEthereumAccount()

    const ethereumRegistryContract = EthereumRegistryContract({
      rpcUrl: ethereumUrl,
      contractAddress: registry.address,
      privateKey: account.ethereumRegistryPrivateKey,
      chainId: ethereumChainId,
    })

    const translateError = (error: Error) => {
      if (error.message.includes('insufficient funds for gas * price + value'))
        throw new EtherBalanceInsufficient()
      throw error
    }

    await ethereumRegistryContract.addCid(cid).catch(translateError)
  }

  return {
    getById,
    getByOwner,
    create,
    addCid,
  }
}
