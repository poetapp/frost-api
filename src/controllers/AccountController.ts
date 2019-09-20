import { createIssuerFromPrivateKey, generateED25519Base58Keys } from '@po.et/poet-js'
import { sign, verify } from 'jsonwebtoken'
import * as Pino from 'pino'

import { Token, TokenOptions } from '../api/Tokens'
import { getApiKeyByNetwork, getTokenByNetwork } from '../api/tokens/CreateToken'
import { AccountDao } from '../daos/AccountDao'
import {
  AccountAlreadyExists,
  AccountNotFound,
  AuthenticationFailed,
  BadToken,
  EmailAlreadyVerified,
  IncorrectOldPassword,
  IncorrectToken,
  InvalidToken,
  ResourceNotFound,
  Unauthorized,
} from '../errors/errors'
import { PasswordHelper } from '../helpers/Password'
import { encrypt } from '../helpers/crypto'
import { tokenMatch } from '../helpers/token'
import { uuid4 } from '../helpers/uuid'
import { isJWTData, JWTData } from '../interfaces/JWTData'
import { Network } from '../interfaces/Network'
import { Account } from '../models/Account'
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
  readonly authorizeRequest: (token: string) => Promise<{ account: Account, tokenData: any }>
  readonly create: (e: EmailPassword) => Promise<Authentication>
  readonly login: (e: EmailPassword) => Promise<Authentication>
  readonly findByIssuer: (issuer: string) => Promise<Account>
  readonly findByEmail: (email: string) => Promise<Account>
  readonly sendAccountVerificationEmail: (id: string, email: string) => Promise<void>
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
    id: string,
    email: string,
    newPassword: string,
  ) => Promise<string>
  readonly getTokens: (account: Account) => Promise<ReadonlyArray<string>>
  readonly addToken: (id: string, network: Network) => Promise<string>
  readonly removeToken: (user: Account, tokenId: string) => Promise<void>
  readonly poeAddressChallenge: (issuer: string) => Promise<string>
}

interface Dependencies {
  readonly logger: Pino.Logger
  readonly accountDao: AccountDao
  readonly sendEmail: SendEmailTo
  readonly passwordHelper: PasswordHelper
}

interface Configuration {
  readonly verifiedAccount: boolean
  readonly jwtSecret: string
  readonly privateKeyEncryptionKey: string
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
    passwordHelper,
  },
  configuration,
}: Arguments): AccountController => {
  const authorizeRequest = async (token: string) => {
    try {
      const { client_token, accountId, email } = decodeJWT(token)
      const tokenData = await Vault.verifyToken(client_token)
      const query = accountId
        ? { id: accountId }
        : { email }
      const account = await accountDao.findOne(query)
      return { tokenData, account }
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
    const encryptedPrivateKey = encrypt(privateKey, configuration.privateKeyEncryptionKey)
    const apiToken = await createJWT({ accountId: id, network: Network.TEST }, Token.TestApiKey)
    const encryptedToken = await Vault.encrypt(`TEST_${apiToken}`)
    const issuer = createIssuerFromPrivateKey(privateKey)
    const hashedPassword = await passwordHelper.hash(password)

    const account: Account = {
      id,
      email,
      emailPublic: false,
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

    const tokenVerifiedAccount = await createJWT({ accountId: id }, Token.VerifyAccount)
    await sendEmail(email).sendVerified(tokenVerifiedAccount)
    const token = await createJWT({ accountId: id }, Token.Login)
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

    if (!await passwordHelper.passwordMatches(password, account.password)) {
      logger.trace({ email, password }, 'Password does not match')
      throw new AccountNotFound()
    }

    const { id, issuer } = account

    const token = await createJWT({ accountId: id }, Token.Login)

    return {
      id,
      issuer,
      token,
    }
  }

  const sendAccountVerificationEmail = async (accountId: string, email: string) => {
    const token = await createJWT({ accountId }, Token.VerifyAccount)
    await sendEmail(email).sendVerified(token)
  }

  const verifyAccount = async (account: Account, tokenData: TokenOptions) => {
    if (account.verified)
      throw new EmailAlreadyVerified()

    if (tokenData.meta.name !== Token.VerifyAccount.meta.name) {
      logger.warn({ account, tokenData }, 'User tried to verify email with incorrect token type.')
      throw new Unauthorized()
    }

    await accountDao.updateOne({ id: account.id }, { verified: true })

    const token = await createJWT({ accountId: account.id }, Token.Login)

    const { id, issuer } = account

    return {
      id,
      issuer,
      token,
    }
  }

  const sendPasswordResetEmail = async (email: string) => {
    const account = await findByEmail(email)

    if (!account)
      throw new AccountNotFound()

    const token = await createJWT({ accountId: account.id }, Token.ForgotPassword)
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

  const changePassword = async (tokenData: TokenOptions, account: Account, password: string, oldPassword: string) => {
    if (tokenData.meta.name !== Token.Login.meta.name)
      throw new IncorrectToken(tokenData.meta.name, Token.Login.meta.name)

    if (!await passwordHelper.passwordMatches(oldPassword, account.password))
      throw new IncorrectOldPassword()

    const newPassword = await passwordHelper.hash(password)

    await accountDao.updateOne({ id: account.id }, { password: newPassword })
  }

  const changePasswordWithToken = async (
    tokenData: TokenOptions,
    id: string,
    email: string,
    newPassword: string,
  ) => {
    const isForgotPasswordToken = tokenMatch(Token.ForgotPassword)

    if (!isForgotPasswordToken(tokenData))
      throw new Unauthorized()

    const password = await passwordHelper.hash(newPassword)

    await accountDao.updateOne({ id }, { password })

    logger.trace({ tokenData }, 'changePasswordWithToken')

    await Vault.revokeToken(tokenData.id)

    await sendEmail(email).changePassword()
    return createJWT({ accountId: id }, Token.Login)
  }

  const getTokens = async (account: Account) => {
    const apiTokensPromise = account.apiTokens.map(({ token }) => Vault.decrypt(token))
    const testApiTokensPromise = account.testApiTokens.map(({ token }) => Vault.decrypt(token))
    return Promise.all([...apiTokensPromise, ...testApiTokensPromise])
  }

  const addToken = async (accountId: string, network: Network) => {
    const apiToken = await createJWT({ accountId, network }, getApiKeyByNetwork(network))
    const testOrMainApiToken = getTokenByNetwork(network, apiToken)
    const apiTokenEncrypted = await Vault.encrypt(testOrMainApiToken)
    await accountDao.insertToken({ id: accountId }, network, apiTokenEncrypted)
    return testOrMainApiToken
  }

  const removeToken = async (account: Account, token: string) => {
    const decryptApiTokens = async (tokens: ReadonlyArray<string>) => {
      const allTokens = tokens.map(Vault.decrypt, Vault)
      return Promise.all(allTokens)
    }

    const encryptApiTokens = async (tokens: ReadonlyArray<string>) => {
      const allTokens = tokens.map(Vault.encrypt, Vault)
      return Promise.all(allTokens)
    }

    const { client_token, network } = decodeJWT(token)

    const encryptedTokenObjects = network === Network.LIVE ? account.apiTokens : account.testApiTokens
    const encryptedTokens = encryptedTokenObjects.map(({ token }) => token)
    const tokens = await decryptApiTokens(encryptedTokens)

    if (!tokens.find(_ => _ === token))
      throw new ResourceNotFound()

    await Vault.revokeToken(client_token)

    const filteredTokens = tokens.filter(_ => _ !== token)
    const encryptedFilteredTokens = await encryptApiTokens(filteredTokens)
    const encryptedFilteredTokensObjects = encryptedFilteredTokens.map(token => ({ token }))

    const update = network === Network.LIVE
      ? { apiTokens: encryptedFilteredTokensObjects }
      : { testApiTokens: encryptedFilteredTokensObjects }

    await accountDao.updateOne({ id: account.id }, update)
  }

  const createJWT = async (jwtData: JWTData, options: TokenOptions) => {
    const tokenVault = await Vault.createToken(options)
    const { client_token } = tokenVault.auth

    return sign({ ...jwtData, client_token }, configuration.jwtSecret)
  }

  const decodeJWT = (token: string): JWTData => {
    const decoded: unknown = verify(token.replace('TEST_', ''), configuration.jwtSecret)

    if (!isJWTData(decoded)) {
      logger.error({ decoded }, 'Unrecognized JWT')
      throw new Error(`Unrecognized JWT`)
    }

    return decoded
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
    getTokens,
    addToken,
    removeToken,
    poeAddressChallenge,
  }
}
