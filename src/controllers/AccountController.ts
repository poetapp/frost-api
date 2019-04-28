import { createIssuerFromPrivateKey, generateED25519Base58Keys } from '@po.et/poet-js'
import * as Pino from 'pino'

import { Token, TokenOptions } from '../api/Tokens'
import { getApiKeyByNetwork, getTokenByNetwork } from '../api/tokens/CreateToken'
import { AccountDao } from '../daos/AccountDao'
import {
  AccountAlreadyExists,
  AccountNotFound,
  IncorrectOldPassword,
  IncorrectToken,
  Unauthorized,
} from '../errors/errors'
import { getToken, tokenMatch } from '../helpers/token'
import { uuid4 } from '../helpers/uuid'
import { Network } from '../interfaces/Network'
import { Account } from '../models/Account'
import { processPassword, passwordMatches } from '../utils/Password'
import { SendEmailTo } from '../utils/SendEmail'
import { Vault } from '../utils/Vault/Vault'

interface EmailPassword {
  readonly email: string
  readonly password: string
}

export interface AccountController {
  readonly create: (e: EmailPassword) => Promise<{ id: string, issuer: string, token: string }>
  readonly findByIssuer: (issuer: string) => Promise<Account>
  readonly findByEmail: (email: string) => Promise<Account>
  readonly sendPasswordResetEmail: (email: string) => Promise<void>
  readonly updateByIssuer: (issuer: string, updates: Partial<Account>) => Promise<void>
  readonly changePassword: (
    tokenData: TokenOptions,
    user: Account,
    password: string,
    oldPassword: string,
  ) => Promise<void>
  readonly changePasswordWithToken: (
    tokenData: TokenOptions,
    issuer: string,
    email: string,
    newPassword: string,
  ) => Promise<string>
  readonly addToken: (issuer: string, email: string, network: Network) => Promise<string>
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

  const findByEmail = (email: string) => accountDao.findOne({ email })

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

  const sendPasswordResetEmail = async (email: string) => {
    const user = await findByEmail(email)

    if (!user)
      throw new AccountNotFound()

    const token = await getToken(email, Token.ForgotPassword)
    await sendEmail(email).sendForgotPassword(token)
  }

  const updateByIssuer = async (issuer: string, updates: Partial<Account>) => {
    await accountDao.updateOne({ issuer }, updates)
  }

  const getUnusedId = async (): Promise<string> => {
    const id = uuid4()
    const account = await accountDao.findOne({ id })
    return !account ? id : getUnusedId()
  }

  const changePassword = async (tokenData: TokenOptions, user: Account, password: string, oldPassword: string) => {
    if (tokenData.meta.name !== Token.Login.meta.name)
      throw new IncorrectToken(tokenData.meta.name, Token.Login.meta.name)

    if (await passwordMatches(oldPassword, user.password))
      throw new IncorrectOldPassword()

    const newPassword = await processPassword(password, configuration.pwnedCheckerRoot) as string

    await updateByIssuer(user.issuer, { password: newPassword })
  }

  const changePasswordWithToken = async (
    tokenData: TokenOptions,
    issuer: string,
    email: string,
    newPassword: string,
  ) => {
    const isForgotPasswordToken = tokenMatch(Token.ForgotPassword)

    if (!isForgotPasswordToken(tokenData))
      throw new Unauthorized()

    const password = (await processPassword(newPassword, configuration.pwnedCheckerRoot)).toString()

    await accountDao.updateOne({ issuer }, { password })

    logger.trace({ tokenData }, 'changePasswordWithToken')

    await Vault.revokeToken(tokenData.id)

    await sendEmail(email).changePassword()
    return getToken(email, Token.Login)
  }

  const addToken = async (issuer: string, email: string, network: Network) => {
    const apiToken = await getToken(email, getApiKeyByNetwork(network), network)
    const testOrMainApiToken = getTokenByNetwork(network, apiToken)
    const apiTokenEncrypted = await Vault.encrypt(testOrMainApiToken)
    await accountDao.insertToken({ issuer }, network, apiTokenEncrypted)
    return testOrMainApiToken
  }

  return {
    create,
    findByIssuer,
    findByEmail,
    updateByIssuer,
    sendPasswordResetEmail,
    changePassword,
    changePasswordWithToken,
    addToken,
  }
}
