import * as Joi from 'joi'
import { errors } from '../../errors/errors'
import { ValidateParams } from '../../middlewares/validate'
import { AccountsController } from '../../modules/Accounts/Accounts.controller'

export const GetAccountSchema: ValidateParams = {
  params: () => ({
    issuer: Joi.string().required(),
  }),
}

export const GetAccount = () => async (ctx: any, next: any): Promise<any> => {
  const logger = ctx.logger(__dirname)

  try {
    const { issuer } = ctx.params

    logger.info({ issuer }, 'GetAccount')

    const accountsController = new AccountsController(ctx.logger, false, null)

    const response = await accountsController.getByIssuer(issuer)

    if (response) {
      const { email, createdAt } = response
      ctx.body = { email, createdAt }
    } else {
      ctx.status = errors.AccountNotFound.code
      ctx.body = errors.AccountNotFound.message
    }
  } catch (exception) {
    logger.error({ exception }, 'api.GetWork')
    ctx.status = 500
  }
}
