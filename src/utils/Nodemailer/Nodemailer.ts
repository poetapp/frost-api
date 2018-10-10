const nodemailer = require('nodemailer')
const mandrill = require('nodemailer-mandrill-transport')

import { NodemailerConfiguration, EmailConfiguration } from './NodemailerConfiguration'

interface NodemailerMethods {
  start(): NodemailerMethods
  sendEmail(options?: EmailConfiguration): Promise<{} | boolean>
}

export const Nodemailer = (configuration: NodemailerConfiguration): NodemailerMethods => {
  return {
    start(): NodemailerMethods {
      const { emailTransportMailDev, maildev } = configuration

      const mandrillTransport = mandrill({
        auth: configuration.mandrill,
      })

      const transport = emailTransportMailDev ? maildev : mandrillTransport
      this.smtpTransport = nodemailer.createTransport(transport)
      return this
    },
    sendEmail(options?: EmailConfiguration): Promise<{} | boolean> {
      const { sendEmailDisabled } = configuration
      if (sendEmailDisabled) return Promise.resolve(true)
      return new Promise((resolve, reject) => {
        this.smtpTransport.sendMail(options, function(err: any) {
          return err ? reject(err) : resolve(true)
        })
      }).catch(e => {
        throw e
      })
    },
  }
}
