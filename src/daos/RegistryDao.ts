import { Collection, Binary } from 'mongodb'

import { bytesToUuid, uuidToBytes } from '../helpers/uuid'
import { Registry } from '../models/Registry'

export interface RegistryDao {
  readonly createIndices: () => Promise<void>
  readonly find: (query: Partial<Registry>) => Promise<ReadonlyArray<Registry>>
  readonly findOne: (query: Partial<Registry>) => Promise<Registry>
  readonly insertOne: (registry: Registry) => Promise<void>
}

export const RegistryDao = (collection: Collection<RegistryDocument>): RegistryDao => {
  const createIndices = async () => {
    await collection.createIndex({ ownerId: 1 }, { unique: false })
  }

  const find = async (query: Partial<Registry>): Promise<ReadonlyArray<Registry>> => {
    const queryDocument = modelToDocument(query)
    const documents = await collection.find(queryDocument, { projection: { _id: 0 } }).toArray()
    return documents.map(documentToModel) as ReadonlyArray<Registry>
  }

  const findOne = async (query: Partial<Registry>): Promise<Registry> => {
    const queryDocument = modelToDocument(query)
    const document = await collection.findOne(queryDocument, { projection: { _id: 0 } })
    return document && documentToModel(document) as Registry
  }

  const insertOne = async (registry: Registry): Promise<void> => {
    const document = modelToDocument(registry) as RegistryDocument
    await collection.insertOne(document)
  }

  return {
    createIndices,
    find,
    findOne,
    insertOne,
  }
}

const documentToModel = (document: Partial<RegistryDocument>): Partial<Registry> => {
  const bufferOrBinaryToUuid = (id: Buffer | Binary) =>
    Buffer.isBuffer(id)
      ? bytesToUuid(id)
      : bytesToUuid(id.buffer)

  const model = {
    ...document,
    id: document.id && bufferOrBinaryToUuid(document.id),
    ownerId: document.ownerId && bufferOrBinaryToUuid(document.ownerId),
  }

  if (!document.id)
    delete model.id
  if (!document.ownerId)
    delete model.ownerId

  return model
}

const modelToDocument = (model: Partial<Registry>): Partial<RegistryDocument> => {
  const document = ({
    ...model,
    id: model.id && uuidToBytes(model.id),
    ownerId: model.ownerId && uuidToBytes(model.ownerId),
  })

  if (!model.id)
    delete document.id
  if (!model.ownerId)
    delete document.ownerId

  return document
}

interface RegistryDocument {
  readonly id: Buffer | Binary
  readonly ownerId: Buffer | Binary
  readonly address: string
}
