import IGenericDAO from '../../interfaces/IGenericDAO'
import { IUser } from './Users.model'

export default class UserController {
  private dao: IGenericDAO<IUser>

  constructor(dao: IGenericDAO<IUser>) {
    this.dao = dao
  }

  public async create(user: IUser) {
    return this.dao.create(user)
  }

  public async get(id: string) {
    return this.dao.get(id)
  }

  public async update(id: string, user: IUser) {
    return this.dao.update(id, user)
  }

  public async delete(id: string) {
    return this.dao.delete(id)
  }
}
