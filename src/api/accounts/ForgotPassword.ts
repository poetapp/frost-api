import * as Joi from 'joi'

import { errors } from '../../errors/errors'
import { AccountsController } from '../../modules/Accounts/Accounts.controller'
import { logger } from '../../utils/Logger/Logger'
import { SendEmailTo } from '../../utils/SendEmail'
import { Token } from '../Tokens'

import { getToken } from './utils/utils'

const { ResourceNotFound } = errors

export const ForgotPasswordSchema = () => ({
  email: Joi.string()
    .email()
    .required(),
})

export const setResponseStatus = (isOk: boolean) => (isOk ? 200 : ResourceNotFound.code)

export const ForgotPassword = (sendEmail: SendEmailTo) => async (ctx: any, next: any): Promise<any> => {
  try {
    const { email } = ctx.request.body
    const usersController = new AccountsController()
    const user = await usersController.get(email)

    ctx.status = setResponseStatus(!!user)
    if (user) {
      const token = await getToken(email, Token.ForgotPassword)
      await sendEmail(email).sendForgotPassword(token)
    } else ctx.body = ResourceNotFound.message
  } catch (e) {
    const { InternalError } = errors
    logger.error('api.ForgotPassword', e)
    ctx.throw(InternalError.code, InternalError.message)
  }
}
