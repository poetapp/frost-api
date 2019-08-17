import { createReadStream } from 'fs'

import { privateToAddress, ecsign, hashPersonalMessage, toRpcSig } from 'ethereumjs-util'
import fetch from 'node-fetch'
import { describe } from 'riteway'

import { Frost } from '../../src/Frost'
import { Path } from '../../src/api/Path'
import {
  testUserEmail,
  testUserPassword,
  FROST_HOST,
  FROST_PORT,
  FROST_URL,
  delay,
  runtimeId,
  createDatabase,
} from '../helpers/utils'

const createUserOptions = {
  method: 'post',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: testUserEmail, password: testUserPassword }),
}

describe('Changing the poeAddress sets poeAddressVerified back to false', async assert => {
  const db = await createDatabase(`test-integration-frost-api-poet-${runtimeId()}`)

  const server = await Frost({
    FROST_PORT,
    FROST_HOST,
    MONGODB_DATABASE: db.settings.tempDbName,
    MONGODB_USER: db.settings.tempDbUser,
    MONGODB_PASSWORD: db.settings.tempDbPassword,
    MONGODB_URL: 'mongodb://localhost:27017/frost', // force calc of url in configuration
    LOGGING_LEVEL: 'error',
    POE_BALANCE_MINIMUM: 0,
  })
  await delay(5000)

  const response = await fetch(`${FROST_URL}${Path.ACCOUNTS}`, createUserOptions)
  const createdUser = await response.json()
  const proofOfPoeUrl = `${FROST_URL}${Path.ACCOUNTS_ID_POE_CHALLENGE}`.replace(':issuer', createdUser.issuer)

  const getProofOfPoeMessageResponse = await fetch(proofOfPoeUrl, {
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
      token: createdUser.token,
    },
  })
  const { poeAddressMessage } = await getProofOfPoeMessageResponse.json()

  assert({
    given: `a request for a Proof of POE Message`,
    should: 'return a Proof of POE Message',
    actual: typeof poeAddressMessage,
    expected: 'string',
  })

  assert({
    given: `a request for a Proof of POE Message`,
    should: 'return a Proof of POE Message',
    actual: poeAddressMessage.startsWith('Proof of POE'),
    expected: true,
  })

  const pk = '0x411813af354a4bfcefc0e4408c51deb6654ae88ddd6cf8a47504c49449f6d462'
  const pkBuffer = Buffer.from(pk.slice(2), 'hex')
  const poeAddress = '0x' + privateToAddress(pkBuffer).toString('hex')
  const hashedmsg = hashPersonalMessage(Buffer.from(poeAddressMessage))
  const sig = ecsign(hashedmsg, pkBuffer)
  const poeSignature = toRpcSig(sig.v, sig.r, sig.s)

  const patchAccountUrl = `${FROST_URL}${Path.ACCOUNTS_ID}`.replace(':issuer', createdUser.issuer)
  const patchAccountResponse = await fetch(patchAccountUrl, {
    method: 'patch',
    headers: {
      'Content-Type': 'application/json',
      token: createdUser.token,
    },
    body: JSON.stringify({
      poeAddress,
      poeSignature,
    }),
  })

  assert({
    given: `a PATCH /accounts with poeAddress and poeSignature`,
    should: 'succeed',
    actual: patchAccountResponse.ok,
    expected: true,
  })

  const patchedAccount = await patchAccountResponse.json()

  assert({
    given: `a patched account with poeAddress and poeSignature`,
    should: 'have the same issuer',
    actual: patchedAccount.issuer,
    expected: createdUser.issuer,
  })
  assert({
    given: `a patched account with poeAddress and poeSignature`,
    should: 'have the same email',
    actual: patchedAccount.email,
    expected: testUserEmail,
  })
  assert({
    given: `a patched account with poeAddress and poeSignature`,
    should: 'have the same poeAddress',
    actual: patchedAccount.poeAddress,
    expected: poeAddress,
  })
  assert({
    given: `a patched account with poeAddress and poeSignature`,
    should: 'have the same poeSignature',
    actual: patchedAccount.poeSignature,
    expected: poeSignature,
  })
  assert({
    given: `a patched account with poeAddress and poeSignature`,
    should: 'have poeAddressVerified = true',
    actual: patchedAccount.poeAddressVerified,
    expected: true,
  })

  const newPoeAddress = 'address'

  const patchAccountResponse2 = await fetch(patchAccountUrl, {
    method: 'patch',
    headers: {
      'Content-Type': 'application/json',
      token: createdUser.token,
    },
    body: JSON.stringify({
      poeAddress: newPoeAddress,
    }),
  })

  assert({
    given: `a PATCH /accounts with poeAddress and poeSignature`,
    should: 'succeed',
    actual: patchAccountResponse2.ok,
    expected: true,
  })

  const patchedAccount2 = await patchAccountResponse2.json()

  assert({
    given: `a patched account with changed poeAddress`,
    should: 'have the new poeAddress',
    actual: patchedAccount2.poeAddress,
    expected: newPoeAddress,
  })
  assert({
    given: `a patched account with changed poeAddress`,
    should: 'have poeAddressVerified = false',
    actual: patchedAccount2.poeAddressVerified,
    expected: false,
  })

  await server.stop()
  await db.teardown()
})

describe('Clearing the poeAddress sets poeAddressVerified back to false', async assert => {
  const db = await createDatabase(`test-integration-frost-api-poet-${runtimeId()}`)

  const server = await Frost({
    FROST_PORT,
    FROST_HOST,
    MONGODB_DATABASE: db.settings.tempDbName,
    MONGODB_USER: db.settings.tempDbUser,
    MONGODB_PASSWORD: db.settings.tempDbPassword,
    MONGODB_URL: 'mongodb://localhost:27017/frost', // force calc of url in configuration
    LOGGING_LEVEL: 'error',
    POE_BALANCE_MINIMUM: 0,
  })
  await delay(5000)

  const response = await fetch(`${FROST_URL}${Path.ACCOUNTS}`, createUserOptions)
  const createdUser = await response.json()
  const proofOfPoeUrl = `${FROST_URL}${Path.ACCOUNTS_ID_POE_CHALLENGE}`.replace(':issuer', createdUser.issuer)

  const getProofOfPoeMessageResponse = await fetch(proofOfPoeUrl, {
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
      token: createdUser.token,
    },
  })
  const { poeAddressMessage } = await getProofOfPoeMessageResponse.json()

  assert({
    given: `a request for a Proof of POE Message`,
    should: 'return a Proof of POE Message',
    actual: typeof poeAddressMessage,
    expected: 'string',
  })

  assert({
    given: `a request for a Proof of POE Message`,
    should: 'return a Proof of POE Message',
    actual: poeAddressMessage.startsWith('Proof of POE'),
    expected: true,
  })

  const pk = '0x411813af354a4bfcefc0e4408c51deb6654ae88ddd6cf8a47504c49449f6d462'
  const pkBuffer = Buffer.from(pk.slice(2), 'hex')
  const poeAddress = '0x' + privateToAddress(pkBuffer).toString('hex')
  const hashedmsg = hashPersonalMessage(Buffer.from(poeAddressMessage))
  const sig = ecsign(hashedmsg, pkBuffer)
  const poeSignature = toRpcSig(sig.v, sig.r, sig.s)

  const patchAccountUrl = `${FROST_URL}${Path.ACCOUNTS_ID}`.replace(':issuer', createdUser.issuer)
  const patchAccountResponse = await fetch(patchAccountUrl, {
    method: 'patch',
    headers: {
      'Content-Type': 'application/json',
      token: createdUser.token,
    },
    body: JSON.stringify({
      poeAddress,
      poeSignature,
    }),
  })

  assert({
    given: `a PATCH /accounts with poeAddress and poeSignature`,
    should: 'succeed',
    actual: patchAccountResponse.ok,
    expected: true,
  })

  const patchedAccount = await patchAccountResponse.json()

  assert({
    given: `a patched account with poeAddress and poeSignature`,
    should: 'have the same issuer',
    actual: patchedAccount.issuer,
    expected: createdUser.issuer,
  })
  assert({
    given: `a patched account with poeAddress and poeSignature`,
    should: 'have the same email',
    actual: patchedAccount.email,
    expected: testUserEmail,
  })
  assert({
    given: `a patched account with poeAddress and poeSignature`,
    should: 'have the same poeAddress',
    actual: patchedAccount.poeAddress,
    expected: poeAddress,
  })
  assert({
    given: `a patched account with poeAddress and poeSignature`,
    should: 'have the same poeSignature',
    actual: patchedAccount.poeSignature,
    expected: poeSignature,
  })
  assert({
    given: `a patched account with poeAddress and poeSignature`,
    should: 'have poeAddressVerified = true',
    actual: patchedAccount.poeAddressVerified,
    expected: true,
  })

  const newPoeAddress = ''

  const patchAccountResponse2 = await fetch(patchAccountUrl, {
    method: 'patch',
    headers: {
      'Content-Type': 'application/json',
      token: createdUser.token,
    },
    body: JSON.stringify({
      poeAddress: newPoeAddress,
    }),
  })

  assert({
    given: `a PATCH /accounts with poeAddress and poeSignature`,
    should: 'succeed',
    actual: patchAccountResponse2.ok,
    expected: true,
  })

  const patchedAccount2 = await patchAccountResponse2.json()

  assert({
    given: `a patched account with changed poeAddress`,
    should: 'have the new poeAddress',
    actual: patchedAccount2.poeAddress,
    expected: newPoeAddress,
  })
  assert({
    given: `a patched account with changed poeAddress`,
    should: 'have poeAddressVerified = false',
    actual: patchedAccount2.poeAddressVerified,
    expected: false,
  })

  await server.stop()
  await db.teardown()
})
