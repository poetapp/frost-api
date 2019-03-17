import * as Pino from 'pino'

import { GenericDAO } from '../../interfaces/GenericDAO'
import { Account } from './Accounts.model'

export class AccountsDAO implements GenericDAO<Account> {
  private readonly logger: Pino.Logger

  constructor(createLogger: (dirname: string) => Pino.Logger) {
    this.logger = createLogger(__dirname)
  }

  public async create(model: Account): Promise<Account> {
    try {
      return await Account.create(model)
    } catch (exception) {
      this.logger.error({ exception }, 'Create account')
      throw exception
    }
  }

  public async get(email: string): Promise<Account> {
    try {
      return await Account.findOne({ email })
    } catch (exception) {
      this.logger.error({ exception }, 'get account')
      throw exception
    }
  }

  public async update(id: string, account: Partial<Account>): Promise<Account> {
    try {
      return await Account.findByIdAndUpdate(id, account, { new: true })
    } catch (exception) {
      this.logger.error({ exception }, 'update account')
      throw exception
    }
  }

  public async delete(id: string): Promise<Account> {
    try {
      return await Account.findByIdAndRemove(id)
    } catch (exception) {
      this.logger.error({ exception }, 'delete account')
      throw exception
    }
  }
}
