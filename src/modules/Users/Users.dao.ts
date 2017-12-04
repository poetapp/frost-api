import { GenericDAO } from '../../interfaces/GenericDAO'
import { logger } from '../../utils/Logger/Logger'
import { UserModel, User } from './Users.model'

export class UsersDAO implements GenericDAO<User> {
  public async create(model: User): Promise<User> {
    try {
      return await UserModel.create(model)
    } catch (e) {
      logger.log('error', 'Create user')
      throw e
    }
  }

  public async get(email: string): Promise<User> {
    try {
      return await UserModel.findOne({ email })
    } catch (e) {
      logger.log('error', 'get user')
      throw e
    }
  }

  public async update(id: string, user: User): Promise<User> {
    try {
      return await UserModel.findByIdAndUpdate(id, user, { new: true })
    } catch (e) {
      logger.log('error', 'update user')
      throw e
    }
  }

  public async delete(id: string): Promise<User> {
    try {
      return await UserModel.findByIdAndRemove(id)
    } catch (e) {
      logger.log('error', 'delete user')
      throw e
    }
  }
}
