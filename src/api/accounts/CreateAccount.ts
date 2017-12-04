import * as Joi from 'joi'
const PasswordComplexity = require('joi-password-complexity')
import { errors } from '../../errors/errors'
import { usersController } from '../../modules/Users/User'
import { SendEmail } from '../../utils/SendEmail/SendEmail'
import { getToken } from './utils/utils'

import { ControllerApi } from '../../interfaces/ControllerApi'

interface ComplexityOptions {
  readonly min: number
  readonly max: number
  readonly lowerCase: number
  readonly upperCase: number
  readonly numeric: number
  readonly symbol: number
}

export class CreateAccount implements ControllerApi {
  async handler(ctx: any, next: any): Promise<any> {
    try {
      const user = ctx.request.body
      const response = await usersController.create(user)
      const { email } = response
      const sendEmail = new SendEmail(email)

      const token = await getToken(email)
      await sendEmail.sendVerified(token)

      ctx.body = { token }
    } catch (e) {
      const { AccountAlreadyExists } = errors
      ctx.throw(AccountAlreadyExists.code, AccountAlreadyExists.message)
    }
  }

  getTextErrorPassword(options: ComplexityOptions): string {
    const mapOptions = Object.entries(options).map(value => {
      return `${value[0]}: ${value[1]} `
    })

    return `Password Requirements, ${mapOptions.join('')}`
  }

  validate(values: any): object {
    const { password } = values

    const complexityOptions = {
      min: 10,
      max: 30,
      lowerCase: 1,
      upperCase: 1,
      numeric: 1,
      symbol: 1
    }

    return {
      email: Joi.string()
        .email()
        .required(),
      password: Joi.validate(
        password,
        new PasswordComplexity(complexityOptions),
        (err, value) => {
          if (err) throw this.getTextErrorPassword(complexityOptions)

          return value
        }
      )
    }
  }
}
