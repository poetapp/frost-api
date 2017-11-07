import IGenericDAO from '../../interfaces/IGenericDAO'
import logger from '../Logger/Logger'
import User, { IUser } from './Users.model'

export default class UserDAO implements IGenericDAO<IUser> {
  public async create(model: IUser): Promise<IUser> {
    try {
      return await User.create(model)
    } catch (e) {
      logger.log('error', 'Create user')
      return e
    }
  }

  public async get(id: string): Promise<IUser> {
    try {
      return await User.findOne({ _id: id })
    } catch (e) {
      logger.log('error', 'get user')
      return e
    }
  }

  public async update(id: string, user: IUser): Promise<IUser> {
    try {
      return await User.findByIdAndUpdate(id, user, { new: true })
    } catch (e) {
      logger.log('error', 'update user')
      return e
    }
  }

  public async delete(id: string): Promise<IUser> {
    try {
      return await User.findByIdAndRemove(id)
    } catch (e) {
      logger.log('error', 'delete user')
      return e
    }
  }
}
