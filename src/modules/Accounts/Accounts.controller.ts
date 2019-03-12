import * as Pino from 'pino'

import { ComplexityOptions } from '../../interfaces/ComplexityOptions'
import { GenericDAO } from '../../interfaces/GenericDAO'
import { AccountsDAO } from './Accounts.dao'
import { Accounts } from './Accounts.interface'

export class AccountsController {
  private dao: GenericDAO<Accounts>

  constructor(createLogger: (dirname: string) => Pino.Logger, verifiedAccount: boolean, pwnedCheckerRoot: string) {
    this.dao = new AccountsDAO(createLogger, verifiedAccount, pwnedCheckerRoot)
  }

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
