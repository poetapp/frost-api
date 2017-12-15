import { Path } from '../../api/Path'
import { configuration } from '../../configuration'
import * as forgotPassword from '../../emails/forgotPassword'
import * as verify from '../../emails/verify'
import { Nodemailer } from '..//Nodemailer/Nodemailer'

export class SendEmail {
  private email: string
  private from: string = `"Po.et" <contact@po.et>`

  constructor(email: string) {
    this.email = email
  }

  async sendForgotPassword(token: string) {
    try {
      const data = {
        to: this.email,
        from: this.from,
        subject: forgotPassword.subject,
        html: forgotPassword.template(token)
      }

      await Nodemailer.sendMail(data)
    } catch (e) {
      throw e
    }
  }

  async sendVerified(token: string) {
    try {
      const { frostUrl } = configuration
      const { ACCOUNTS_VERIFY } = Path
      const data = {
        to: this.email,
        from: this.from,
        subject: verify.subject,
        html: verify.template(`${frostUrl}${ACCOUNTS_VERIFY}/${token}`)
      }

      await Nodemailer.sendMail(data)
    } catch (e) {
      throw e
    }
  }
}
