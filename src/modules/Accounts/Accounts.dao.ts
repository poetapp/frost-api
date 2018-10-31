import { Model } from 'mongoose'
import * as Pino from 'pino'

import { GenericDAO } from '../../interfaces/GenericDAO'
import { Accounts } from './Accounts.interface'
import { AccountsModel } from './Accounts.model'

export class AccountsDAO implements GenericDAO<Accounts> {
  private readonly accountsModel: Model<Accounts>
  private logger: Pino.Logger

  constructor(createLogger: (dirname: string) => Pino.Logger, verifiedAccount: boolean, pwnedCheckerRoot: string) {
    this.logger = createLogger(__dirname)
    this.accountsModel = AccountsModel(verifiedAccount, pwnedCheckerRoot)
  }

  public async create(model: Accounts): Promise<Accounts> {
    try {
      return await this.accountsModel.create(model)
    } catch (exception) {
      this.logger.error({ exception }, 'Create account')
      throw exception
    }
  }

  public async get(email: string): Promise<Accounts> {
    try {
      return await this.accountsModel.findOne({ email })
    } catch (exception) {
      this.logger.error({ exception }, 'get account')
      throw exception
    }
  }

  public async update(id: string, account: Accounts): Promise<Accounts> {
    try {
      return await this.accountsModel.findByIdAndUpdate(id, account, { new: true })
    } catch (exception) {
      this.logger.error({ exception }, 'update account')
      throw exception
    }
  }

  public async delete(id: string): Promise<Accounts> {
    try {
      return await this.accountsModel.findByIdAndRemove(id)
    } catch (exception) {
      this.logger.error({ exception }, 'delete account')
      throw exception
    }
  }
}
