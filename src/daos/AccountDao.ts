import { Collection, Binary } from 'mongodb'

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

export const AccountDao = (collection: Collection): AccountDao => {
  const createIndices = async () => {
    await collection.createIndex({ email: 1 }, { unique: true })
    await collection.createIndex({ id: 1 }, { unique: true })
  }

  const insertOne = async (account: Account): Promise<void> => {
    const document = modelToDocument(account)
    await collection.insertOne(document)
  }

  const findOne = async (filter: Partial<Account>): Promise<Account> => {
    const document = modelToDocument(filter)
    const account: AccountDocument = await collection.findOne(document)
    return account && documentToModel(account) as Account
  }

  const updateOne = async (filter: Partial<Account>, updates: Partial<Account>): Promise<void> => {
    const filterDocument = modelToDocument(filter)
    const updatesDocument = modelToDocument(updates)
    await collection.updateOne(filterDocument, { $set: updatesDocument })
  }

  const insertToken = async (filter: Partial<Account>, network: Network, token: string): Promise<void> => {
    const filterDocument = modelToDocument(filter)
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
