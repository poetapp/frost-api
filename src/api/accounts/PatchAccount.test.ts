// tslint:disable:max-line-length

import { describe } from 'riteway'

import { Account } from '../../models/Account'
import { isPoeAddressVerified } from './PatchAccount'

const account: Account = {
  issuer: '',
  email: '',
  emailPublic: false,
  password: '',
  verified: true,
  privateKey: '',
  publicKey: '',
  createdAt: '',
  poeAddressMessage: 'Proof of POE',
  poeAddressVerified: false,
}

const signedMessage = {
  address: '0xbe7d20a0f75dbccb82efe6ae3af1768e5e83d0b8',
  msg: 'Proof of POE',
  sig: '0x5e06a683754daa113774b42a1c3fd1f038b95e82eea918d404bab8d229df4ed06a4f5497aa9969a55aa559b97a48655d99b08c6992134c2d5d65b3becb11cf2b1c',
  version: '3',
  signer: 'MEW',
}

describe('isPoeAddressVerified()', async (assert) => {

  // Positive cases - whats provided in request + what was already in account is correct

  assert({
    given: 'correct address, signature and message combination in request',
    should: 'return true',
    actual: isPoeAddressVerified(signedMessage.address, signedMessage.sig, account),
    expected: true,
  })
  assert({
    given: 'correct address in request, correct signature and message in account',
    should: 'return false',
    actual: isPoeAddressVerified(signedMessage.address, undefined, {
      ...account,
      poeAddressSignature: signedMessage.sig,
    }),
    expected: true,
  })
  assert({
    given: 'signature but no address',
    should: 'return false',
    actual: isPoeAddressVerified(undefined, signedMessage.sig, {
      ...account,
      poeAddress: signedMessage.address,
    }),
    expected: true,
  })

  // Negative cases - missing data

  assert({
    given: 'address but no signature',
    should: 'return false',
    actual: isPoeAddressVerified(signedMessage.address, undefined, {
      ...account,
      poeAddressVerified: true,
    }),
    expected: false,
  })
  assert({
    given: 'signature but no address',
    should: 'return false',
    actual: isPoeAddressVerified(undefined, signedMessage.sig, {
      ...account,
      poeAddressVerified: true,
    }),
    expected: false,
  })

  // Negative cases - incorrect signature

  assert({
    given: 'an unmatching signature in the request',
    should: 'return false',
    actual: isPoeAddressVerified(signedMessage.address, '123123123', {
      ...account,
      poeAddressVerified: true,
    }),
    expected: false,
  })

  assert({
    given: 'an unmatching signature in the account',
    should: 'return false',
    actual: isPoeAddressVerified(signedMessage.address, undefined, {
      ...account,
      poeAddressVerified: true,
      poeAddressSignature: '123123123',
    }),
    expected: false,
  })

  assert({
    given: 'another unmatching signature in the request',
    should: 'return false',
    actual: isPoeAddressVerified('asdasdasd', signedMessage.sig, {
      ...account,
      poeAddressVerified: true,
    }),
    expected: false,
  })

  assert({
    given: 'another unmatching signature in the account',
    should: 'return false',
    actual: isPoeAddressVerified('asdasdasd', undefined, {
      ...account,
      poeAddressVerified: true,
      poeAddressSignature: signedMessage.sig,
    }),
    expected: false,
  })

  // Default cases - nothing provided in request should not change anything

  assert({
    given: 'address and signature missing from both request and account',
    should: 'return the existing value of poeAddressVerified',
    actual: isPoeAddressVerified(undefined, undefined, account),
    expected: false,
  })
  assert({
    given: 'address and signature missing from both request and account',
    should: 'return the existing value of poeAddressVerified',
    actual: isPoeAddressVerified(undefined, undefined, {
      ...account,
      poeAddressVerified: true,
    }),
    expected: true,
  })
  assert({
    given: 'address and signature both missing in request but present in account',
    should: 'return the existing value of poeAddressVerified',
    actual: isPoeAddressVerified(undefined, undefined, {
      ...account,
      poeAddress: signedMessage.address,
      poeAddressSignature: signedMessage.sig,
      poeAddressVerified: true,
    }),
    expected: true,
  })
  assert({
    given: 'address and signature both missing in request but present in account',
    should: 'return the existing value of poeAddressVerified',
    actual: isPoeAddressVerified(undefined, undefined, {
      ...account,
      poeAddress: signedMessage.address,
      poeAddressSignature: signedMessage.sig,
      poeAddressVerified: false,
    }),
    expected: false,
  })
})
