import * as Pino from 'pino'

import { GenericDAO } from '../../interfaces/GenericDAO'
import { SendEmailTo } from '../../utils/SendEmail'

import { AccountsDAO } from './Accounts.dao'
import { Account } from './Accounts.model'

export class AccountsController {
  private readonly dao: GenericDAO<Account>
  private readonly logger: Pino.Logger

  constructor(
    createLogger: (dirname: string) => Pino.Logger,
    readonly verifiedAccount: boolean,
    readonly pwnedCheckerRoot: string,
    readonly sendEmail?: SendEmailTo,
  ) {
    this.logger = createLogger(__dirname)
    this.dao = new AccountsDAO(createLogger)
  }

  public get(email: string): Promise<Account> {
    return this.dao.get(email)
  }

}
