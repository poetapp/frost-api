import { Collection } from 'mongodb'

import { bytesToUuid, uuidToBytes } from '../helpers/uuid'
import { Account } from '../models/Account'

export interface AccountDao {
  findOne: (filter: Partial<Account>) => Promise<Account>
}

export const AccountDao = (collection: Collection): AccountDao => {
  const findOne = async (filter: Partial<Account>): Promise<Account> => {
    const document = modelToDocument(filter)
    const account: AccountDocument = await collection.findOne(document)
    return documentToModel(account) as Account
  }

  return {
    findOne,
  }
}

const documentToModel = (document: Partial<AccountDocument>): Partial<Account> => {
  const model = {
    ...document,
    id: document.id && bytesToUuid(document.id),
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
  readonly id?: Buffer
  readonly email: string
  readonly password: string
  readonly verified: boolean
  readonly privateKey: string
  readonly publicKey: string
  readonly createdAt: string
  readonly apiTokens: [Token]
  readonly testApiTokens: [Token]
  readonly issuer: string
  readonly name: string
  readonly bio: string
  readonly ethereumAddress: string
}

interface Token {
  readonly token: string
}
