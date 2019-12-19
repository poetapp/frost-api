import Pino from 'pino'

import { PoetNode } from '../daos/PoetNodeDao'
import { FileTooBig, PoeAddressNotVerified, PoeBalanceInsufficient } from '../errors/errors'
import { Erc20 } from '../helpers/Erc20'
import { Network } from '../interfaces/Network'
import { Account } from '../models/Account'

export interface ArchiveController {
  readonly postArchive: (
    account: Account,
    archive: ReadableStream,
    network: Network,
    fileSize: number,
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
  readonly ethereumUrl: string
  readonly poeContractDecimals: number
  readonly poeContractAddress: string
  readonly poeBalanceMinimum: number
  readonly maximumFileSizeInBytes: number
}

export const ArchiveController = ({
  dependencies: {
    logger,
    mainnetNode,
    testnetNode,
  },
  configuration: {
    ethereumUrl,
    poeContractDecimals,
    poeContractAddress,
    poeBalanceMinimum,
    maximumFileSizeInBytes,
  },
}: Arguments): ArchiveController => {
  logger.info({ poeContractAddress, poeBalanceMinimum }, 'ArchiveController Instantiated')

  const poeContract = Erc20({ ethereumUrl, contractAddress: poeContractAddress })

  const networkToNode = (network: Network) => network === Network.LIVE ? mainnetNode : testnetNode

  const postArchive = async (account: Account, archive: ReadableStream, network: Network, fileSize: number) => {
    if (fileSize > maximumFileSizeInBytes)
      throw new FileTooBig(fileSize, maximumFileSizeInBytes)

    const node = networkToNode(network)

    const { id: userId, email, poeAddress, poeAddressVerified } = account

    logger.debug({ userId, email, poeAddress, poeAddressVerified, network })

    if (!poeAddressVerified)
      throw new PoeAddressNotVerified()

    const poeBalance = await poeContract.getBalance(poeAddress)

    const poeBalanceWithDecimals = poeBalance / Math.pow(10, poeContractDecimals)

    if (poeBalanceWithDecimals < poeBalanceMinimum)
      throw new PoeBalanceInsufficient(poeBalanceMinimum, poeBalanceWithDecimals)

    return node.postArchive(archive)
  }

  return {
    postArchive,
  }
}
