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

describe('Try to upload an archive without Proof of POE', async assert => {
  return
  const db = await createDatabase(`test-integration-frost-api-poet-${runtimeId()}`)
// dummy change
  const server = await Frost({
    FROST_PORT,
    FROST_HOST,
    MONGODB_DATABASE: db.settings.tempDbName,
    MONGODB_USER: db.settings.tempDbUser,
    MONGODB_PASSWORD: db.settings.tempDbPassword,
    MONGODB_URL: 'mongodb://localhost:27017/frost', // force calc of url in configuration
    LOGGING_LEVEL: 'error',
  })
  await delay(5000)

  const response = await fetch(`${FROST_URL}${Path.ACCOUNTS}`, createUserOptions)
  const createdUser = await response.json()

  assert({
    given: `a "${createUserOptions.method}" request to ${Path.ACCOUNTS}`,
    should: 'return ok = true',
    actual: response.ok,
    expected: true,
  })

  assert({
    given: `valid input and a "${createUserOptions.method}" request to ${Path.ACCOUNTS}`,
    should: 'return a token property in the response',
    actual: Object.keys(createdUser).includes('token'),
    expected: true,
  })

  const getTokensResponse = await fetch(`${FROST_URL}${Path.TOKENS}`, {
    headers: {
      'Content-Type': 'application/json',
      token: createdUser.token,
    },
  })
  const { apiTokens: [apiKey = null] = [] } = await getTokensResponse.json()

  assert({
    given: 'a GET /tokens',
    should: 'return one API Key',
    actual: typeof apiKey,
    expected: 'string',
  })

  const fileStream = createReadStream(__filename)

  const uploadArchiveOptions = {
    method: 'post',
    headers: {
      token: apiKey,
    },
    body: fileStream,
  }

  const uploadResponse = await fetch(`${FROST_URL}${Path.ARCHIVES}`, uploadArchiveOptions)

  assert({
    given: `valid input and a "${uploadArchiveOptions.method}" request to ${Path.ARCHIVES}`,
    should: 'fail',
    actual: uploadResponse.ok,
    expected: false,
  })

  assert({
    given: `valid input and a "${uploadArchiveOptions.method}" request to ${Path.ARCHIVES}`,
    should: 'fail with error message',
    actual: await uploadResponse.text(),
    expected: 'POE address not verified.',
  })

  await server.stop()
  await db.teardown()
})

describe('Try to upload an archive with Proof of POE but without POE balance', async assert => {

  return
  const db = await createDatabase(`test-integration-frost-api-poet-${runtimeId()}`)

  const server = await Frost({
    FROST_PORT,
    FROST_HOST,
    MONGODB_DATABASE: db.settings.tempDbName,
    MONGODB_USER: db.settings.tempDbUser,
    MONGODB_PASSWORD: db.settings.tempDbPassword,
    MONGODB_URL: 'mongodb://localhost:27017/frost', // force calc of url in configuration
    LOGGING_LEVEL: 'error',
    POE_BALANCE_MINIMUM: 1000,
  })
  await delay(5000)

  const response = await fetch(`${FROST_URL}${Path.ACCOUNTS}`, createUserOptions)
  const createdUser = await response.json()

  assert({
    given: `a "${createUserOptions.method}" request to ${Path.ACCOUNTS}`,
    should: 'return ok = true',
    actual: response.ok,
    expected: true,
  })

  assert({
    given: `valid input and a "${createUserOptions.method}" request to ${Path.ACCOUNTS}`,
    should: 'return a token property in the response',
    actual: Object.keys(createdUser).includes('token'),
    expected: true,
  })

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

  const getTokensResponse = await fetch(`${FROST_URL}${Path.TOKENS}`, {
    headers: {
      'Content-Type': 'application/json',
      token: createdUser.token,
    },
  })
  const { apiTokens: [apiKey = null] = [] } = await getTokensResponse.json()

  assert({
    given: 'a GET /tokens',
    should: 'return one API Key',
    actual: typeof apiKey,
    expected: 'string',
  })

  const fileStream = createReadStream(__filename)

  const uploadArchiveOptions = {
    method: 'post',
    headers: {
      token: apiKey,
    },
    body: fileStream,
  }

  const uploadResponse = await fetch(`${FROST_URL}${Path.ARCHIVES}`, uploadArchiveOptions)

  assert({
    given: `valid input and a "${uploadArchiveOptions.method}" request to ${Path.ARCHIVES}`,
    should: 'fail',
    actual: uploadResponse.ok,
    expected: false,
  })

  assert({
    given: `valid input and a "${uploadArchiveOptions.method}" request to ${Path.ARCHIVES}`,
    should: 'fail',
    actual: await uploadResponse.text(),
    expected: 'Insufficient POE balance. You need at least 1000 POE. You currently have 0.',
  })

  await server.stop()
  await db.teardown()
})

describe('Upload an archive with Proof of POE with enough POE balance', async assert => {

  return
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

  assert({
    given: `a "${createUserOptions.method}" request to ${Path.ACCOUNTS}`,
    should: 'return ok = true',
    actual: response.ok,
    expected: true,
  })

  assert({
    given: `valid input and a "${createUserOptions.method}" request to ${Path.ACCOUNTS}`,
    should: 'return a token property in the response',
    actual: Object.keys(createdUser).includes('token'),
    expected: true,
  })

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

  const getTokensResponse = await fetch(`${FROST_URL}${Path.TOKENS}`, {
    headers: {
      'Content-Type': 'application/json',
      token: createdUser.token,
    },
  })
  const { apiTokens: [apiKey = null] = [] } = await getTokensResponse.json()

  assert({
    given: 'a GET /tokens',
    should: 'return one API Key',
    actual: typeof apiKey,
    expected: 'string',
  })

  const fileStream = createReadStream(__filename)

  const uploadArchiveOptions = {
    method: 'post',
    headers: {
      token: apiKey,
    },
    body: fileStream,
  }

  const uploadResponse = await fetch(`${FROST_URL}${Path.ARCHIVES}`, uploadArchiveOptions)

  assert({
    given: `valid input and a "${uploadArchiveOptions.method}" request to ${Path.ARCHIVES}`,
    should: 'fail',
    actual: uploadResponse.ok,
    expected: true,
  })

  const uploadedFiles = await uploadResponse.json()

  assert({
    given: `valid input and a "${uploadArchiveOptions.method}" request to ${Path.ARCHIVES}`,
    should: 'return an array',
    actual: Array.isArray(uploadedFiles),
    expected: true,
  })

  assert({
    given: `valid input and a "${uploadArchiveOptions.method}" request to ${Path.ARCHIVES}`,
    should: 'return an archiveUrl property in the response',
    actual: Object.keys(uploadedFiles[0]).includes('archiveUrl'),
    expected: true,
  })

  assert({
    given: `valid input and a "${uploadArchiveOptions.method}" request to ${Path.ARCHIVES}`,
    should: 'return an archiveUrl property in the response, of type string',
    actual: typeof uploadedFiles[0].archiveUrl,
    expected: 'string',
  })

  await server.stop()
  await db.teardown()
})
