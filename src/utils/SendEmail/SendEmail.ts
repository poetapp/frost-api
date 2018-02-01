import { configuration } from '../../configuration'
import * as forgotPassword from '../../emails/forgotPassword'
import * as verify from '../../emails/verify'
import { Nodemailer } from '..//Nodemailer/Nodemailer'

export class SendEmail {
  private email: string
  private from: string = `"${configuration.emailFrom}" <${
    configuration.emailReply
  }>`

  constructor(email: string) {
    this.email = email
  }

  async sendForgotPassword(token: string) {
    try {
      const { frostChangePassword } = configuration
      const data = {
        to: this.email,
        from: this.from,
        subject: forgotPassword.subject,
        html: forgotPassword.template(`${frostChangePassword}?token=${token}`)
      }

      await Nodemailer.sendMail(data)
    } catch (e) {
      throw e
    }
  }

  async sendVerified(token: string) {
    try {
      const { frostVerifiedAccount } = configuration
      const data = {
        to: this.email,
        from: this.from,
        subject: verify.subject,
        html: verify.template(`${frostVerifiedAccount}?token=${token}`)
      }

      await Nodemailer.sendMail(data)
    } catch (e) {
      throw e
    }
  }
}
