import { Collection, Binary } from 'mongodb'

import { asyncPipe } from '../helpers/asyncPipe'
import { encrypt, decrypt } from '../helpers/crypto'
import { bytesToUuid, uuidToBytes } from '../helpers/uuid'
import { Network } from '../interfaces/Network'
import { Account } from '../models/Account'
import { Vault } from '../utils/Vault/Vault'

export interface AccountDao {
  createIndices: () => Promise<void>
  insertOne: (account: Account) => Promise<void>
  findOne: (filter: Partial<Account>) => Promise<Account>
  updateOne: (filter: Partial<Account>, updates: Partial<Account>) => Promise<void>
  insertToken: (filter: Partial<Account>, network: Network, token: string) => Promise<void>
}

export const AccountDao = (collection: Collection, encryptionKey: string): AccountDao => {
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
    const apiTokenEncrypted = await Vault.encrypt(token)
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
  const encryptedAccount = {
    ...account,
    privateKey: account.privateKey && encrypt(account.privateKey, encryptionKey),
    apiTokens: account.apiTokens && await encryptApiTokens(account.apiTokens),
    testApiTokens: account.testApiTokens && await encryptApiTokens(account.testApiTokens),
  }

  if (!account.privateKey)
    delete encryptedAccount.privateKey
  if (!account.apiTokens)
    delete encryptedAccount.apiTokens
  if (!account.testApiTokens)
    delete encryptedAccount.testApiTokens

  return encryptedAccount
}

const decryptAccount = (decryptionKey: string) => async (account: Partial<Account>): Promise<Partial<Account>> => {
  const decryptedAccount = {
    ...account,
    privateKey: account.privateKey && decrypt(account.privateKey, decryptionKey),
    apiTokens: account.apiTokens && await decryptApiTokens(account.apiTokens),
    testApiTokens: account.testApiTokens && await decryptApiTokens(account.testApiTokens),
  }

  if (!account.privateKey)
    delete decryptedAccount.privateKey
  if (!account.apiTokens)
    delete decryptedAccount.apiTokens
  if (!account.testApiTokens)
    delete decryptedAccount.testApiTokens

  return decryptedAccount
}

const encryptApiTokens = async (tokens: ReadonlyArray<Token>): Promise<ReadonlyArray<Token>> => {
  const allTokens = tokens.map(({ token }) => token).map(Vault.encrypt, Vault)
  const encryptedTokens = await Promise.all(allTokens)
  return encryptedTokens.map(token => ({ token }))
}

const decryptApiTokens = async (tokens: ReadonlyArray<Token>): Promise<ReadonlyArray<Token>> => {
  const allTokens = tokens.map(({ token }) => token).map(Vault.decrypt, Vault)
  const decryptedTokens = await Promise.all(allTokens)
  return decryptedTokens.map(token => ({ token }))
}

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
}

interface Token {
  readonly token: string
}
