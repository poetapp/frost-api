const {
  MONGODB_URL,
  VAULT_URL,
  VAULT_TOKEN,
  POET_URL,
  FROST_URL,
  FROST_VERIFIED_ACCOUNT,
  FROST_CHANGE_PASSWORD,
  VERIFIED_ACCOUNT,
  EMAIL_REPLY,
  EMAIL_FROM,
  SEND_EMAIL_DISABLED,
  EMAIL_TRANSPORT_MAIL_DEV,
  MAX_API_TOKENS
} = process.env

export const configuration = {
  vaultToken: VAULT_TOKEN || undefined,
  vaultUrl: VAULT_URL || 'http://localhost:8200',
  mongodbUrl: MONGODB_URL || 'mongodb://localhost:27017/frost',
  poetUrl: POET_URL || 'http://localhost:18080',
  frostUrl: FROST_URL || 'http://localhost:3000',
  frostVerifiedAccount: FROST_VERIFIED_ACCOUNT || '',
  frostChangePassword: FROST_CHANGE_PASSWORD || '',
  transactionalMandrill: '46mwv_E6dOxrSDUkJD4NOQ',
  jwt: '2cff77d8f0a411e78c3f9a214cf093ae',
  verifiedAccount: VERIFIED_ACCOUNT === 'true' ? true : false,
  emailReply: EMAIL_REPLY || 'contact@po.et',
  emailFrom: EMAIL_FROM || 'Po.et',
  sendEmailDisabled: SEND_EMAIL_DISABLED === 'true' ? true : false,
  emailTransportMailDev: EMAIL_TRANSPORT_MAIL_DEV === 'true' ? true : false,
  maxApiTokens: parseInt(MAX_API_TOKENS, 10) || 5,
  passwordComplex: {
    min: 10,
    max: 30,
    lowerCase: 1,
    upperCase: 1,
    numeric: 1,
    symbol: 1
  }
}
