import * as forgotPassword from '../../emails/forgotPassword'
import * as verify from '../../emails/verify'
import { Nodemailer } from '../Nodemailer'

import { SendEmailConfiguration, SendEmailTo } from './SendEmailConfiguration'

export const SendEmail = (configuration: SendEmailConfiguration): SendEmailTo => (to: string) => {
  const from = `"${configuration.emailFrom}" <${configuration.emailReply}>`
  const nodemailer = Nodemailer(configuration.nodemailer).start()

  return {
    async sendForgotPassword(token: string) {
      try {
        const { frostChangePassword } = configuration
        const html = forgotPassword.template(`${frostChangePassword}?token=${token}`)
        const subject = forgotPassword.subject
        const data = { to, from, subject, html }

        await nodemailer.sendEmail(data)
      } catch (e) {
        throw e
      }
    },
    async sendVerified(token: string) {
      try {
        const { frostVerifiedAccount } = configuration
        const html = verify.template(`${frostVerifiedAccount}?token=${token}`)
        const subject = verify.subject
        const data = { to, from, subject, html }

        await nodemailer.sendEmail(data)
      } catch (e) {
        throw e
      }
    },
  }
}
