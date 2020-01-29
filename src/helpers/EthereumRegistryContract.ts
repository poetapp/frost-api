import { tap } from 'ramda'
import Web3 from 'web3'
import { SignedTransaction, TransactionConfig, TransactionReceipt } from 'web3-core'
import { ContractSendMethod } from 'web3-eth-contract'

import { EthereumRegistryContractAbi } from './EthereumRegistryContractAbi'
import { asyncPipe } from './asyncPipe'

interface EthereumRegistryContractArguments {
  readonly rpcUrl?: string
  readonly contractAddress: string
  readonly privateKey?: string
  readonly gasPrice?: number
  readonly chainId?: number
}

export interface EthereumRegistryContract {
  readonly accountAddress: string
  readonly close: () => void
  readonly getCidCount: () => Promise<number>
  readonly getCid: (index: number) => Promise<string>
  readonly getCids: (from: number, count: number) => Promise<ReadonlyArray<string>>
  readonly addCid: (cid: string) => Promise<string>
  readonly onCidAdded: any
  readonly getTransactionReceipt: (hash: string) => Promise<TransactionReceipt>
}

const pickRawTransaction = (_: SignedTransaction) => _.rawTransaction

export const EthereumRegistryContract = ({
  rpcUrl = 'http://localhost:8545',
  contractAddress,
  privateKey,
  gasPrice = 1e9,
  chainId = 1984,
}: EthereumRegistryContractArguments): EthereumRegistryContract => {
  const web3 = new Web3(rpcUrl)
  const account = privateKey && web3.eth.accounts.privateKeyToAccount(privateKey)
  const contract = new web3.eth.Contract(EthereumRegistryContractAbi, contractAddress)

  const close = () => {
    if (web3.currentProvider instanceof Web3.providers.WebsocketProvider)
      web3.currentProvider.disconnect(null, null)
  }

  const getCidCount = () => contract.methods.getCidCount().call().then(parseInt)

  const getCid = (index: number) => contract.methods.cids(index).call()

  const getCids = (from: number, count: number = 3) => Promise.all(
    Array(count)
      .fill(null)
      .map((_, index) => from + index)
      .map(getCid),
  )

  const createTransaction = async (method: ContractSendMethod): Promise<TransactionConfig> => ({
    from: account.address,
    to: contractAddress,
    gas: await method.estimateGas(),
    gasPrice,
    data: method.encodeABI(),
    chainId,
    nonce: await web3.eth.getTransactionCount(account.address, 'pending'),
  })

  /**
   * Sends a signed transaction. Unlike web3.eth.sendSignedTransaction, this method resolves to the
   * transaction hash immediately, not waiting for any block confirmation at all.
   * Rejects on any error.
   *
   * See https://github.com/ethereum/web3.js/issues/1547#issuecomment-557341601
   *
   * @param rawTransaction
   */
  const sendSignedTransaction = (rawTransaction: string): Promise<string> => new Promise((resolve, reject) => {
    const observer = web3.eth.sendSignedTransaction(rawTransaction)
    observer.on('error', reject)
    observer.on('transactionHash', resolve)
  })

  const createSignAndSendTransaction = account && asyncPipe(
    createTransaction,
    account.signTransaction,
    pickRawTransaction,
    sendSignedTransaction,
  )

  const addCid = (cid: string) => createSignAndSendTransaction(contract.methods.addCid(cid))

  const onCidAdded = contract.events.CidAdded

  const getTransactionReceipt = web3.eth.getTransactionReceipt

  return {
    accountAddress: account && account.address,
    close,
    getCidCount,
    getCid,
    getCids,
    addCid,
    onCidAdded,
    getTransactionReceipt,
  }
}
