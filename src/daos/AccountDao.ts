import { Collection, Binary } from 'mongodb'
import { pipe } from 'ramda'

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
  const modelToEncryptedDocument = pipe(encryptAccount(encryptionKey), modelToDocument)
  const documentToDecryptedModel = pipe(documentToModel, decryptAccount(encryptionKey))

  const createIndices = async () => {
    await collection.createIndex({ email: 1 }, { unique: true })
    await collection.createIndex({ id: 1 }, { unique: false })
  }

  const insertOne = async (account: Account): Promise<void> => {
    const document = modelToEncryptedDocument(account)
    await collection.insertOne(document)
  }

  const findOne = async (filter: Partial<Account>): Promise<Account> => {
    const document = modelToEncryptedDocument(filter)
    const account: AccountDocument = await collection.findOne(document)
    return account && documentToDecryptedModel(account) as Account
  }

  const updateOne = async (filter: Partial<Account>, updates: Partial<Account>): Promise<void> => {
    const filterDocument = modelToEncryptedDocument(filter)
    const updatesDocument = modelToEncryptedDocument(updates)
    await collection.updateOne(filterDocument, { $set: updatesDocument })
  }

  const insertToken = async (filter: Partial<Account>, network: Network, token: string): Promise<void> => {
    const filterDocument = modelToEncryptedDocument(filter)
    const array = network === Network.LIVE ? 'apiTokens' : 'testApiTokens'
    await collection.updateOne(filterDocument, { $push: { [array]: { token } }})
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

const encryptAccount = (encryptionKey: string) => (account: Partial<Account>): Partial<Account> => {
  const encryptedAccount = {
    ...account,
    privateKey: account.privateKey && encrypt(account.privateKey, encryptionKey),
  }

  if (!account.privateKey)
    delete encryptedAccount.privateKey

  return encryptedAccount
}

const decryptAccount = (decryptionKey: string) => (account: Partial<Account>): Partial<Account> => {
  const decryptedAccount = {
    ...account,
    privateKey: account.privateKey && decrypt(account.privateKey, decryptionKey),
  }

  if (!account.privateKey)
    delete decryptedAccount.privateKey

  return decryptedAccount
}

interface AccountDocument {
  readonly id?: Buffer | Binary
  readonly email: string
  readonly password: string
  readonly verified: boolean
  readonly privateKey: string
  readonly publicKey: string
  readonly createdAt: string
  readonly apiTokens: Token[]
  readonly testApiTokens: Token[]
  readonly issuer: string
  readonly name: string
  readonly bio: string
  readonly ethereumAddress: string
}

interface Token {
  readonly token: string
}
