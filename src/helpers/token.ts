import { isNil, path } from 'ramda'

import { Network } from '../interfaces/Network'

export const tokenMatch = (expected: any) => (actual: any) => {
  const expectedVal = path(['meta', 'name'], expected)
  const actualVal = path(['meta', 'name'], actual)

  return isNil(expectedVal) || isNil(actualVal) ? false : expectedVal === actualVal
}

export const isLiveNetwork = (network: string) => network === Network.LIVE
