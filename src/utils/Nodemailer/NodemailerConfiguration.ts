export interface EmailConfiguration {
  to: string
  from: string
  subject: string
  text?: string
  html?: string
}
export interface MandrillConfiguration {
  readonly apiKey: string
  readonly damain?: string
}

export interface MaildevConfiguration {
  readonly host: string
  readonly port: number
  readonly ignoreTLS: boolean
}

export interface NodemailerConfiguration {
  mandrill: MandrillConfiguration
  maildev: MaildevConfiguration
  sendEmailDisabled: boolean
  emailTransportMailDev: boolean
}
