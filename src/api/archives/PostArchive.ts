import { ArchiveController } from '../../controllers/ArchiveController'
import { IncorrectToken } from '../../errors/errors'
import { Token } from '../Tokens'

export const PostArchive = (archiveController: ArchiveController) => async (ctx: any, next: any): Promise<any> => {
  const { req } = ctx.request
  const { user, tokenData } = ctx.state

  const allowedTokens = [Token.ApiKey.meta.name, Token.TestApiKey.meta.name]

  if (!allowedTokens.includes(tokenData.data.meta.name))
    throw new IncorrectToken(tokenData.data.meta.name, allowedTokens)

  const contentLength = parseInt(req.headers['content-length'], 10)

  const response = await archiveController.postArchive(user, req, tokenData.data.meta.network, contentLength)

  ctx.status = 200
  ctx.body = response
}
