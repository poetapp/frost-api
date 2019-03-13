import * as Joi from 'joi'
import { verify } from 'jsonwebtoken'
import { errors } from '../../errors/errors'
import { Account } from '../../modules/Accounts/Accounts.model'
import { Vault } from '../../utils/Vault/Vault'

const getApiTokens = (user: Account) => {
  return user.apiTokens.map(({ token }) => token)
}

const getTestApiTokens = (user: Account) => {
  return user.testApiTokens.map(({ token }) => token)
}

const decryptApiTokens = async (tokens: ReadonlyArray<string>) => {
  const allTokens = tokens.map(Vault.decrypt, Vault)
  return Promise.all(allTokens)
}

const encryptApiTokens = async (tokens: ReadonlyArray<string>) => {
  const allTokens = tokens.map(Vault.encrypt, Vault)
  return Promise.all(allTokens)
}

export const RemoveTokenSchema = () => ({
  tokenId: Joi.string().required(),
})

export const RemoveToken = () => async (ctx: any, next: any): Promise<any> => {
  const logger = ctx.logger(__dirname)
  const { ResourceNotFound } = errors

  try {
    const { user, jwtSecret } = ctx.state
    const { tokenId } = ctx.params

    const apiTokensDecrypted = await decryptApiTokens(getApiTokens(user))
    const testApiTokensDecrypted = await decryptApiTokens(getTestApiTokens(user))

    const apiTokensFiltered = apiTokensDecrypted.filter((token: string) => token !== tokenId)
    const testApiTokensFiltered = testApiTokensDecrypted.filter((token: string) => token !== tokenId)

    if (
      apiTokensDecrypted.length === apiTokensFiltered.length &&
      testApiTokensDecrypted.length === testApiTokensFiltered.length
    ) {
      ctx.status = ResourceNotFound.code
      ctx.body = ResourceNotFound.message
      return
    }

    const { client_token } = verify(tokenId.replace('TEST_', ''), jwtSecret, {
      ignoreExpiration: true,
    }) as {
      email: string
      client_token: string
      iat: number,
    }

    await Vault.revokeToken(client_token)
    if (apiTokensDecrypted.length !== apiTokensFiltered.length) {
      const apiTokensEncrypted = await encryptApiTokens(apiTokensFiltered)
      const updateApiTokens = apiTokensEncrypted.map((token: string) => ({
        token,
      }))

      user.apiTokens = updateApiTokens
    } else {
      const testApiTokensEncrypted = await encryptApiTokens(testApiTokensFiltered)
      const updateTestApiTokens = testApiTokensEncrypted.map((token: string) => ({
        token,
      }))

      user.testApiTokens = updateTestApiTokens
    }

    user.save()

    ctx.status = 200
  } catch (exception) {
    logger.error(exception, 'api.RemoveToken')
    ctx.status = 500
  }
}
