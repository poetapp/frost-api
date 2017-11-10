import * as nodemailer from 'nodemailer'
const mandrillTransport = require('nodemailer-mandrill-transport')

import { Email } from './Email'
import { Options } from './Options'

export namespace Nodemailer {
  export function config(options?: Options) {
    this.smtpTransport = nodemailer.createTransport(
      mandrillTransport({
        auth: {
          apiKey: options.apiKey
        }
      })
    )
  }

  export function sendMail(options?: Email) {
    return new Promise((resolve, reject) => {
      this.smtpTransport.sendMail(options, function(err: any) {
        return err ? reject(err) : resolve(true)
      })
    }).catch(e => {
      throw e
    })
  }
}
