import * as Joi from 'joi'
import { lte } from 'ramda'

import { errors } from '../../errors/errors'
import { Network } from '../../interfaces/Network'
import { Vault } from '../../utils/Vault/Vault'
import { Token } from '../Tokens'
import { getToken, isLiveNetwork } from '../accounts/utils/utils'

export const isEmptyObject = (o: object) => Object.keys(o).length === 0
export const addPrefixTest = (apiToken: string) => `TEST_${apiToken}`
export const getTokensLengthByNetwork = (network: string, { apiTokens, testApiTokens }: any) =>
  isLiveNetwork(network) ? apiTokens.length : testApiTokens.length
export const getTokenByNetwork = (network: string, apiToken: string) =>
  isLiveNetwork(network) ? apiToken : addPrefixTest(apiToken)
export const getApiKeyByNetwork = (network: string) => (isLiveNetwork(network) ? Token.ApiKey : Token.TestApiKey)
export const extractNetwork = (ctx: any) => (isEmptyObject(ctx.request.body) ? Network.TEST : ctx.request.body.network)

export const CreateToken = (maxApiTokens: number) => async (ctx: any, next: any): Promise<any> => {
  const logger = ctx.logger(__dirname)
  const tooManyApiTokens = lte(maxApiTokens)
  const { MaximumApiTokensLimitReached } = errors

  try {
    const { user } = ctx.state
    const network = extractNetwork(ctx)

    if (tooManyApiTokens(getTokensLengthByNetwork(network, user))) {
      ctx.status = MaximumApiTokensLimitReached.code
      ctx.body = MaximumApiTokensLimitReached.message
      return
    }
    const { email } = user
    const apiToken = await getToken(email, getApiKeyByNetwork(network), network)
    const testOrMainApiToken = getTokenByNetwork(network, apiToken)
    const apiTokenEncrypted = await Vault.encrypt(testOrMainApiToken)
    isLiveNetwork(network)
      ? user.apiTokens.push({ token: apiTokenEncrypted })
      : user.testApiTokens.push({ token: apiTokenEncrypted })
    user.save()

    ctx.body = {
      apiToken: testOrMainApiToken,
    }
  } catch (exception) {
    logger.error({ exception }, 'api.CreateToken')
    ctx.status = 500
  }
}

export const CreateTokenSchema = () => ({
  network: Joi.string().default(Network.TEST).required,
})
