import * as Pino from 'pino'

import { PoetNode } from '../daos/PoetNodeDao'
import { PoeAddressNotVerified, PoeBalanceInsufficient } from '../errors/errors'
import { fetchBalance } from '../helpers/ethereum'
import { Network } from '../interfaces/Network'
import { Account } from '../models/Account'

export interface ArchiveController {
  readonly postArchive: (
    account: Account,
    archive: ReadableStream,
    network: Network,
  ) => Promise<any>
}

interface Arguments {
  readonly dependencies: Dependencies
  readonly configuration: Configuration
}

interface Dependencies {
  readonly logger: Pino.Logger
  readonly mainnetNode: PoetNode
  readonly testnetNode: PoetNode
}

interface Configuration {
  readonly poeContractAddress: string
  readonly poeBalanceMinimum: number
}

export const ArchiveController = ({
  dependencies: {
    logger,
    mainnetNode,
    testnetNode,
  },
  configuration: {
    poeContractAddress,
    poeBalanceMinimum,
  },
}: Arguments): ArchiveController => {
  logger.info({ poeContractAddress, poeBalanceMinimum }, 'ArchiveController Instantiated')

  const fetchPoeBalance = fetchBalance(poeContractAddress)

  const networkToNode = (network: Network) => network === Network.LIVE ? mainnetNode : testnetNode

  const postArchive = async (account: Account, archive: ReadableStream, network: Network) => {
    const node = networkToNode(network)

    const { id: userId, email, poeAddress, poeAddressVerified } = account

    logger.debug({ userId, email, poeAddress, poeAddressVerified, network })

    if (!poeAddressVerified)
      throw new PoeAddressNotVerified()

    const poeBalance = await fetchPoeBalance(poeAddress)

    if (poeBalance < poeBalanceMinimum)
      throw new PoeBalanceInsufficient(poeBalanceMinimum, poeBalance)

    return node.postArchive(archive)
  }

  return {
    postArchive,
  }
}
