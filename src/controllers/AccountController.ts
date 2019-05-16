import { createIssuerFromPrivateKey, generateED25519Base58Keys } from '@po.et/poet-js'
import { sign, verify } from 'jsonwebtoken'
import * as Pino from 'pino'

import { Token, TokenOptions } from '../api/Tokens'
import { getApiKeyByNetwork, getTokenByNetwork } from '../api/tokens/CreateToken'
import { AccountDao } from '../daos/AccountDao'
import {
  AccountAlreadyExists,
  AccountNotFound, AuthenticationFailed, BadToken, EmailAlreadyVerified,
  IncorrectOldPassword,
  IncorrectToken, InvalidToken,
  Unauthorized,
} from '../errors/errors'
import { tokenMatch } from '../helpers/token'
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

interface Authentication {
  readonly id: string
  readonly issuer: string
  readonly token: string
}

export interface AccountController {
  readonly authorizeRequest: (token: string) => Promise<{ account: Account, tokenData: any, jwt: any }>
  readonly create: (e: EmailPassword) => Promise<Authentication>
  readonly login: (e: EmailPassword) => Promise<Authentication>
  readonly findByIssuer: (issuer: string) => Promise<Account>
  readonly findByEmail: (email: string) => Promise<Account>
  readonly sendAccountVerificationEmail: (email: string) => Promise<void>
  readonly verifyAccount: (account: Account, tokenData: TokenOptions) => Promise<Authentication>
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
  readonly poeAddressChallenge: (issuer: string) => Promise<string>
}

interface Dependencies {
  readonly logger: Pino.Logger
  readonly accountDao: AccountDao
  readonly sendEmail: SendEmailTo
}

interface Configuration {
  readonly verifiedAccount: boolean
  readonly pwnedCheckerRoot: string
  readonly jwtSecret: string
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
  const authorizeRequest = async (token: string) => {
    try {
      const decoded = verify(token.replace('TEST_', ''), configuration.jwtSecret)
      const { client_token, email } = decoded as any

      const tokenData = await Vault.verifyToken(client_token)
      const account = await findByEmail(email)
      return { jwt: configuration.jwtSecret, tokenData, account }
    } catch (error) {
      logger.error({ error }, 'Authorization Error')

      switch (error.message) {
        case 'bad token':
          throw new BadToken()
        case 'invalid token':
          throw new InvalidToken()
        case 'jwt malformed':
          throw new InvalidToken()
        default:
          throw new AuthenticationFailed()
      }
    }
  }

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
    const hashedPassword = await processPassword(password, configuration.pwnedCheckerRoot)

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

  const login = async ({ email, password }: EmailPassword) => {
    const account = await findByEmail(email)

    if (!account) {
      logger.trace({ email, password }, 'Account not found')
      throw new AccountNotFound()
    }

    if (!await passwordMatches(password, account.password)) {
      logger.trace({ email, password }, 'Password does not match')
      throw new AccountNotFound()
    }

    const token = await getToken(email, Token.Login)

    const { id, issuer } = account

    return {
      id,
      issuer,
      token,
    }
  }

  const sendAccountVerificationEmail = async (email: string) => {
    const token = await getToken(email, Token.VerifyAccount)
    await sendEmail(email).sendVerified(token)
  }

  const verifyAccount = async (account: Account, tokenData: TokenOptions) => {
    if (account.verified)
      throw new EmailAlreadyVerified()

    if (tokenData.meta.name !== Token.VerifyAccount.meta.name) {
      logger.warn({ account, tokenData }, 'User tried to verify email with incorrect token type.')
      throw new Unauthorized()
    }

    await updateByIssuer(account.issuer, { verified: true })

    const token = await getToken(account.email, Token.Login)

    const { id, issuer } = account

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

    if (!await passwordMatches(oldPassword, user.password))
      throw new IncorrectOldPassword()

    const newPassword = await processPassword(password, configuration.pwnedCheckerRoot)

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

    const password = await processPassword(newPassword, configuration.pwnedCheckerRoot)

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

  const getToken = async (email: string, options: TokenOptions, network?: Network) => {
    const tokenVault = await Vault.createToken(options)
    const { client_token } = tokenVault.auth

    return sign({ email, client_token, network }, configuration.jwtSecret)
  }

  const poeAddressChallenge = async (issuer: string) => {
    const { email } = await accountDao.findOne({ issuer })
    const poeAddressMessage = `Proof of POE ${email} ${new Date().toISOString()}`
    await accountDao.updateOne({ issuer }, { poeAddressMessage, poeAddressVerified: false })
    return poeAddressMessage
  }

  return {
    authorizeRequest,
    login,
    create,
    findByIssuer,
    findByEmail,
    updateByIssuer,
    sendAccountVerificationEmail,
    verifyAccount,
    sendPasswordResetEmail,
    changePassword,
    changePasswordWithToken,
    addToken,
    poeAddressChallenge,
  }
}
