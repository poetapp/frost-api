import { GenericDAO } from '../../interfaces/GenericDAO'
import { User } from './Users.model'

export class UsersController {
  private dao: GenericDAO<User>

  constructor(dao: GenericDAO<User>) {
    this.dao = dao
  }

  public create(user: User) {
    return this.dao.create(user)
  }

  public get(email: string): Promise<User> {
    return this.dao.get(email)
  }

  public update(id: string, user: User) {
    return this.dao.update(id, user)
  }

  public delete(id: string) {
    return this.dao.delete(id)
  }
}
