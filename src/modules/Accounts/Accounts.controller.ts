import { ComplexityOptions } from '../../interfaces/ComplexityOptions'
import { GenericDAO } from '../../interfaces/GenericDAO'
import { AccountsDAO } from './Accounts.dao'
import { Accounts } from './Accounts.interface'

export class AccountsController {
  private dao: GenericDAO<Accounts>

  constructor(verifiedAccount: boolean) {
    this.dao = new AccountsDAO(verifiedAccount)
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

  public getTextErrorPassword(options: ComplexityOptions): string {
    const mapOptions = Object.entries(options).map(value => {
      return `${value[0]}: ${value[1]} `
    })

    return `Password Requirements, ${mapOptions.join('')}`
  }
}
