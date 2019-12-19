import Web3 = require('web3')

import Erc20Abi from './Erc20Abi.json'

interface Arguments {
  readonly ethereumUrl: string
  readonly contractAddress: string
}

export const Erc20 = ({
  ethereumUrl,
  contractAddress,
}: Arguments) => {
  const web3 = new Web3(new Web3.providers.HttpProvider(ethereumUrl))
  const contractInstance = new web3.eth.Contract(Erc20Abi, contractAddress)

  const getName = () => contractInstance.methods.name().call()
  const getSymbol = () => contractInstance.methods.symbol().call()
  const getDecimals = () => contractInstance.methods.decimals().call()
  const getBalance = (address: string) => contractInstance.methods.balanceOf(address).call()

  return {
    getName,
    getSymbol,
    getDecimals,
    getBalance,
  }
}
