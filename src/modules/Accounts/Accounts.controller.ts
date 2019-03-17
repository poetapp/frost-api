import { createIssuerFromPrivateKey, generateED25519Base58Keys } from '@po.et/poet-js'
import * as Pino from 'pino'

import { Token } from '../../api/Tokens'
import { getToken } from '../../api/accounts/utils/utils'
import { GenericDAO } from '../../interfaces/GenericDAO'
import { Network } from '../../interfaces/Network'
import { processPassword } from '../../utils/Password'
import { SendEmailTo } from '../../utils/SendEmail'
import { Vault } from '../../utils/Vault/Vault'

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

  public async create({ email, password }: { email: string, password: string }) {
    this.logger.debug({ email }, 'Creating account')

    const { privateKey, publicKey } = generateED25519Base58Keys()
    const encryptedPrivateKey = await Vault.encrypt(privateKey)
    const apiToken = await getToken(email, Token.TestApiKey, Network.TEST)
    const encryptedToken = await Vault.encrypt(`TEST_${apiToken}`)
    const issuer = createIssuerFromPrivateKey(privateKey)

    const account = new Account({
      email,
      password: (await processPassword(password, this.pwnedCheckerRoot)).toString(),
      privateKey: encryptedPrivateKey,
      publicKey,
      createdAt: Date.now().toString(), // .toString(): legacy reasons
      verified: this.verifiedAccount,
      testApiTokens: [{ token: encryptedToken }],
      issuer,
    })

    this.logger.trace({ account }, 'Creating account')

    await this.dao.create(account)

    const tokenVerifiedAccount = await getToken(email, Token.VerifyAccount)
    await this.sendEmail(email).sendVerified(tokenVerifiedAccount)
    return getToken(email, Token.Login)
  }

  public get(email: string): Promise<Account> {
    return this.dao.get(email)
  }

  public getByIssuer(issuer: string): Promise<Account | null> {
    return Account.findOne({ issuer }).exec()
  }

  public update(id: string, account: Partial<Account>) {
    return this.dao.update(id, account)
  }

  public delete(id: string) {
    return this.dao.delete(id)
  }

}
