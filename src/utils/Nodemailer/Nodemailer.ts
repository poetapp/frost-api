const nodemailer = require('nodemailer')
const mandrill = require('nodemailer-mandrill-transport')

import { configuration } from '../../configuration'
import { Email } from './Email'
import { Options } from './Options'

export namespace Nodemailer {
  export function config(options?: Options) {
    const { emailTransportMailDev } = configuration

    const mandrillTransport = mandrill({
      auth: options,
    })

    const maildev = {
      port: 1025,
      ignoreTLS: true,
    }

    const transport = emailTransportMailDev ? maildev : mandrillTransport
    this.smtpTransport = nodemailer.createTransport(transport)
  }

  export function sendMail(options?: Email) {
    const { sendEmailDisabled } = configuration
    if (sendEmailDisabled) return Promise.resolve()
    return new Promise((resolve, reject) => {
      this.smtpTransport.sendMail(options, function(err: any) {
        return err ? reject(err) : resolve(true)
      })
    }).catch(e => {
      throw e
    })
  }
}
