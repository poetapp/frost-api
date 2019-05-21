import { describe } from 'riteway'

import { signatureIsValid } from './ethereum'

describe('signatureIsValid()', async (assert) => {
  const signedMessage = {
    address: '0xBe7d20A0f75DbcCb82EFe6AE3aF1768E5E83D0B8',
    msg: 'Proof of POE',
    sig: '0x5e06a683754daa113774b42a1c3fd1f038b95e82eea918d404bab8d229df4ed0' +
      '6a4f5497aa9969a55aa559b97a48655d99b08c6992134c2d5d65b3becb11cf2b1c',
    version: '3',
    signer: 'MEW',
  }

  const secondAddress = '0xc2e359382B61356e37AF9523f20771fa6fc1C8fC'

  assert({
    given: 'a correct checksum-cased address, signature and message combination',
    should: 'return true',
    actual: signatureIsValid(signedMessage.address, signedMessage.msg, signedMessage.sig),
    expected: true,
  })

  assert({
    given: 'a correct non-checksum-cased address, signature and message combination',
    should: 'return true',
    actual: signatureIsValid(signedMessage.address.toLowerCase(), signedMessage.msg, signedMessage.sig),
    expected: true,
  })

  assert({
    given: 'a signature that matches the message but not the address',
    should: 'return false',
    actual: signatureIsValid(secondAddress, signedMessage.msg, signedMessage.sig),
    expected: false,
  })

  assert({
    given: 'an empty signature',
    should: 'return false',
    actual: signatureIsValid(signedMessage.address, signedMessage.msg, ''),
    expected: false,
  })

  assert({
    given: 'an empty message',
    should: 'return false',
    actual: signatureIsValid(signedMessage.address, '', signedMessage.sig),
    expected: false,
  })

  assert({
    given: 'an invalid signature',
    should: 'return false',
    actual: signatureIsValid(signedMessage.address, signedMessage.msg, 'saywhat'),
    expected: false,
  })
})
