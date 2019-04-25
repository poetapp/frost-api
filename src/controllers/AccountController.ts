import { createIssuerFromPrivateKey, generateED25519Base58Keys } from '@po.et/poet-js'
import * as Pino from 'pino'

import { Token } from '../api/Tokens'
import { getToken } from '../api/accounts/utils/utils'
import { AccountDao } from '../daos/AccountDao'
import { AccountAlreadyExists } from '../errors/errors'
import { uuid4s } from '../helpers/uuid'
import { Network } from '../interfaces/Network'
import { Account } from '../models/Account'
import { processPassword } from '../utils/Password'
import { SendEmailTo } from '../utils/SendEmail'
import { Vault } from '../utils/Vault/Vault'

interface EmailPassword {
  readonly email: string
  readonly password: string
}

export interface AccountController {
  readonly create: (e: EmailPassword) => Promise<{ id: string, issuer: string, token: string }>
  readonly findByIssuer: (issuer: string) => Promise<Account>
}

interface Dependencies {
  readonly logger: Pino.Logger
  readonly accountDao: AccountDao
  readonly sendEmail: SendEmailTo
}

interface Configuration {
  readonly verifiedAccount: boolean,
  readonly pwnedCheckerRoot: string,
}

interface Arguments {
  readonly dependencies: Dependencies
  readonly configuration: Configuration
}

export const AccountController = ({
  dependencies: {
    logger,
    accountDao,
    sendEmail,
  },
  configuration,
}: Arguments): AccountController => {
  const findByIssuer = (issuer: string) => accountDao.findOne({ issuer })

  const create = async ({ email, password }: EmailPassword) => {
    logger.debug({ email }, 'Creating account')

    const existing = await accountDao.findOne({ email })

    if (existing)
      throw new AccountAlreadyExists()

    const id = await getUnusedId()
    const { privateKey, publicKey } = generateED25519Base58Keys()
    const encryptedPrivateKey = await Vault.encrypt(privateKey)
    const apiToken = await getToken(email, Token.TestApiKey, Network.TEST)
    const encryptedToken = await Vault.encrypt(`TEST_${apiToken}`)
    const issuer = createIssuerFromPrivateKey(privateKey)
    const hashedPassword = (await processPassword(password, configuration.pwnedCheckerRoot)).toString()

    const account: Account = {
      id,
      email,
      password: hashedPassword,
      privateKey: encryptedPrivateKey,
      publicKey,
      createdAt: Date.now().toString(), // .toString(): legacy reasons
      verified: configuration.verifiedAccount,
      testApiTokens: [{ token: encryptedToken }],
      issuer,
    }

    logger.trace({ account }, 'Creating account')

    await accountDao.insertOne(account)

    const tokenVerifiedAccount = await getToken(email, Token.VerifyAccount)
    await sendEmail(email).sendVerified(tokenVerifiedAccount)
    const token = await getToken(email, Token.Login)
    return {
      id,
      issuer,
      token,
    }
  }

  const getUnusedId = async (): Promise<string> => {
    const id = uuid4s()
    const account = await accountDao.findOne({ id })
    return !account ? id : getUnusedId()
  }

  return {
    create,
    findByIssuer,
  }
}
