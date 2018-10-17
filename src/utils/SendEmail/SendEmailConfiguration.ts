import { NodemailerConfiguration } from 'utils/Nodemailer/NodemailerConfiguration'

export interface Emails {
  readonly sendForgotPassword: (token: string) => Promise<void>
  readonly sendVerified: (token: string) => Promise<void>
  readonly changePassword: () => Promise<void>
}

export type SendEmailTo = (to: string) => Emails

export interface SendEmailConfiguration {
  readonly nodemailer: NodemailerConfiguration
  readonly emailFrom: string
  readonly emailReply: string
  readonly frostChangePassword: string
  readonly frostVerifiedAccount: string
}
