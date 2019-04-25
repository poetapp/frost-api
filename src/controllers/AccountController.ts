import { AccountDao } from '../daos/AccountDao'
import { Account } from '../models/Account'

export interface AccountController {
  readonly findByIssuer: (issuer: string) => Promise<Account>
}

export const AccountController = (accountDao: AccountDao): AccountController => {
  const findByIssuer = (issuer: string) => accountDao.findOne({ issuer })

  return {
    findByIssuer,
  }
}
