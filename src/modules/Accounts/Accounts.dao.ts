import { GenericDAO } from '../../interfaces/GenericDAO'
import { logger } from '../../utils/Logger/Logger'
import { Accounts } from './Accounts.interface'
import { AccountsModel } from './Accounts.model'

export class AccountsDAO implements GenericDAO<Accounts> {
  public async create(model: Accounts): Promise<Accounts> {
    try {
      return await AccountsModel.create(model)
    } catch (e) {
      logger.log('error', 'Create account')
      throw e
    }
  }

  public async get(email: string): Promise<Accounts> {
    try {
      return await AccountsModel.findOne({ email })
    } catch (e) {
      logger.log('error', 'get account')
      throw e
    }
  }

  public async update(id: string, account: Accounts): Promise<Accounts> {
    try {
      return await AccountsModel.findByIdAndUpdate(id, account, { new: true })
    } catch (e) {
      logger.log('error', 'update account')
      throw e
    }
  }

  public async delete(id: string): Promise<Accounts> {
    try {
      return await AccountsModel.findByIdAndRemove(id)
    } catch (e) {
      logger.log('error', 'delete account')
      throw e
    }
  }
}
