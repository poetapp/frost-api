import * as nodemailer from 'nodemailer'
const transport = require('nodemailer-mandrill-transport')

import { Email } from './Email'
import { Options } from './Options'

export namespace Nodemailer {
  export function config(options?: Options) {
    this.smtpTransport = nodemailer.createTransport(
      transport({
        auth: options
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
