import * as Joi from 'joi'
import { lte } from 'ramda'

import { AccountController } from '../../controllers/AccountController'
import { errors } from '../../errors/errors'
import { isLiveNetwork } from '../../helpers/token'
import { Network } from '../../interfaces/Network'
import { Token } from '../Tokens'

export const isEmptyObject = (o: object) => Object.keys(o).length === 0
export const addPrefixTest = (apiToken: string) => `TEST_${apiToken}`
export const getTokensLengthByNetwork = (network: string, { apiTokens, testApiTokens }: any) =>
  isLiveNetwork(network) ? apiTokens.length : testApiTokens.length
export const getTokenByNetwork = (network: string, apiToken: string) =>
  isLiveNetwork(network) ? apiToken : addPrefixTest(apiToken)
export const getApiKeyByNetwork = (network: string) => (isLiveNetwork(network) ? Token.ApiKey : Token.TestApiKey)
export const extractNetwork = (ctx: any) => (isEmptyObject(ctx.request.body) ? Network.TEST : ctx.request.body.network)

export const CreateToken = (
  maxApiTokens: number,
  accountController: AccountController,
) => async (ctx: any, next: any): Promise<any> => {
  const tooManyApiTokens = lte(maxApiTokens)
  const { MaximumApiTokensLimitReached } = errors

  const { user } = ctx.state
  const network = extractNetwork(ctx)

  if (tooManyApiTokens(getTokensLengthByNetwork(network, user))) {
    ctx.status = MaximumApiTokensLimitReached.code
    ctx.body = MaximumApiTokensLimitReached.message
    return
  }

  const testOrMainApiToken = await accountController.addToken(user.id, network)

  ctx.body = {
    apiToken: testOrMainApiToken,
  }
}

export const CreateTokenSchema = () => ({
  network: Joi.string().default(Network.TEST).required,
})
