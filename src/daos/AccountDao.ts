import { flow } from 'fp-ts/lib/function'
import { Collection, Binary } from 'mongodb'

import { asyncPipe } from '../helpers/asyncPipe'
import { encrypt, decrypt } from '../helpers/crypto'
import { bytesToUuid, uuidToBytes } from '../helpers/uuid'
import { Network } from '../interfaces/Network'
import { Account } from '../models/Account'

export interface AccountDao {
  createIndices: () => Promise<void>
  insertOne: (account: Account) => Promise<void>
  findOne: (filter: Partial<Account>) => Promise<Account>
  updateOne: (filter: Partial<Account>, updates: Partial<Account>) => Promise<void>
  insertToken: (filter: Partial<Account>, network: Network, token: string) => Promise<void>
}

export const AccountDao = (collection: Collection, encryptionKey: string): AccountDao => {
  const encryptWithKey = encrypt(encryptionKey)
  const modelToEncryptedDocument = asyncPipe(encryptAccount(encryptionKey), modelToDocument)
  const documentToDecryptedModel = asyncPipe(documentToModel, decryptAccount(encryptionKey))

  const createIndices = async () => {
    await collection.createIndex({ email: 1 }, { unique: true })
    await collection.createIndex({ id: 1 }, { unique: false })
  }

  const insertOne = async (account: Account): Promise<void> => {
    const document = await modelToEncryptedDocument(account)
    await collection.insertOne(document)
  }

  const findOne = async (filter: Partial<Account>): Promise<Account> => {
    const document = await modelToEncryptedDocument(filter)
    const account: AccountDocument = await collection.findOne(document)
    return account && documentToDecryptedModel(account) as Promise<Account>
  }

  const updateOne = async (filter: Partial<Account>, updates: Partial<Account>): Promise<void> => {
    const filterDocument = await modelToEncryptedDocument(filter)
    const updatesDocument = await modelToEncryptedDocument(updates)
    await collection.updateOne(filterDocument, { $set: updatesDocument })
  }

  const insertToken = async (filter: Partial<Account>, network: Network, token: string): Promise<void> => {
    const filterDocument = await modelToEncryptedDocument(filter)
    const array = network === Network.LIVE ? 'apiTokens' : 'testApiTokens'
    const apiTokenEncrypted = encryptWithKey(token)
    await collection.updateOne(filterDocument, { $push: { [array]: { token: apiTokenEncrypted } }})
  }

  return {
    createIndices,
    insertOne,
    findOne,
    updateOne,
    insertToken,
  }
}

const documentToModel = (document: Partial<AccountDocument>): Partial<Account> => {
  const bufferOrBinaryToUuid = (id: Buffer | Binary) =>
    Buffer.isBuffer(id)
      ? bytesToUuid(id)
      : bytesToUuid(id.buffer)

  const model = {
    ...document,
    id: document.id && bufferOrBinaryToUuid(document.id),
    apiTokens: document.apiTokens || [],
    testApiTokens: document.testApiTokens || [],
  }

  if (!document.id)
    delete model.id

  return model
}

const modelToDocument = (model: Partial<Account>): Partial<AccountDocument> => {
  const document = ({
    ...model,
    id: model.id && uuidToBytes(model.id),
  })

  if (!model.id)
    delete document.id

  return document
}

const encryptAccount = (encryptionKey: string) => async (account: Partial<Account>): Promise<Partial<Account>> => {
  const encryptWithKey = encrypt(encryptionKey)
  const encryptApiToken = flow(tokenObjectToToken, encryptWithKey, tokenToTokenObject)

  const encryptedAccount = {
    ...account,
    privateKey: account.privateKey && encryptWithKey(account.privateKey),
    ethereumRegistryPrivateKey: account.ethereumRegistryPrivateKey
      && encryptWithKey(account.ethereumRegistryPrivateKey),
    apiTokens: account.apiTokens && account.apiTokens.map(encryptApiToken),
    testApiTokens: account.testApiTokens && account.testApiTokens.map(encryptApiToken),
  }

  if (!account.privateKey)
    delete encryptedAccount.privateKey
  if (!account.ethereumRegistryPrivateKey)
    delete encryptedAccount.ethereumRegistryPrivateKey
  if (!account.apiTokens)
    delete encryptedAccount.apiTokens
  if (!account.testApiTokens)
    delete encryptedAccount.testApiTokens

  return encryptedAccount
}

const decryptAccount = (decryptionKey: string) => async (account: Partial<Account>): Promise<Partial<Account>> => {
  const decryptWithKey = decrypt(decryptionKey)
  const decryptApiToken = flow(tokenObjectToToken, decryptWithKey, tokenToTokenObject)

  const decryptedAccount = {
    ...account,
    privateKey: account.privateKey && decryptWithKey(account.privateKey),
    ethereumRegistryPrivateKey: account.ethereumRegistryPrivateKey
      && decryptWithKey(account.ethereumRegistryPrivateKey),
    apiTokens: account.apiTokens && account.apiTokens.map(decryptApiToken),
    testApiTokens: account.testApiTokens && account.testApiTokens.map(decryptApiToken),
  }

  if (!account.privateKey)
    delete decryptedAccount.privateKey
  if (!account.ethereumRegistryPrivateKey)
    delete decryptedAccount.ethereumRegistryPrivateKey
  if (!account.apiTokens)
    delete decryptedAccount.apiTokens
  if (!account.testApiTokens)
    delete decryptedAccount.testApiTokens

  return decryptedAccount
}

const tokenToTokenObject = (token: string): Token => ({ token })
const tokenObjectToToken = ({ token }: Token): string => token

interface AccountDocument {
  readonly id?: Buffer | Binary
  readonly email: string
  readonly password: string
  readonly verified: boolean
  readonly privateKey: string
  readonly publicKey: string
  readonly createdAt: string
  readonly apiTokens: ReadonlyArray<Token>
  readonly testApiTokens: ReadonlyArray<Token>
  readonly issuer: string
  readonly name: string
  readonly bio: string
  readonly ethereumAddress: string
  readonly ethereumRegistryPrivateKey?: string
  readonly ethereumRegistryAddress?: string
}

interface Token {
  readonly token: string
}
