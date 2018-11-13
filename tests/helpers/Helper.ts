import { promisify } from 'util'

const delay = promisify(setTimeout)

/**
 *  Give the Node 300ms for the messages to be passed around and responded internally.
 *  Not particularly deterministic, but we can expect something to be wrong if integration
 *  tests cause such big delays.
 */
export function waitForNode() {
  return delay(1300)
}
