import { injectDao } from '../../decorators/injectDao/injectDao'
import { GenericDAO } from '../../interfaces/GenericDAO'
import { AccountsDAO } from './Accounts.dao'
import { Accounts } from './Accounts.interface'

@injectDao(AccountsDAO)
export class AccountsController {
  private dao: GenericDAO<Accounts>

  public create(account: Accounts) {
    return this.dao.create(account)
  }

  public get(email: string): Promise<Accounts> {
    return this.dao.get(email)
  }

  public update(id: string, account: Accounts) {
    return this.dao.update(id, account)
  }

  public delete(id: string) {
    return this.dao.delete(id)
  }
}
