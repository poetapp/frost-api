import { GenericDAO } from '../../interfaces/GenericDAO'
import { User } from './Users.model'

export class UsersController {
  private dao: GenericDAO<User>

  constructor(dao: GenericDAO<User>) {
    this.dao = dao
  }

  public async create(user: User) {
    return this.dao.create(user)
  }

  public async get(email: string): Promise<User> {
    return this.dao.get(email)
  }

  public async update(id: string, user: User) {
    return this.dao.update(id, user)
  }

  public async delete(id: string) {
    return this.dao.delete(id)
  }
}
