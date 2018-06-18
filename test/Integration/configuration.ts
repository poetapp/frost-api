const { MONGODB_URL, FROST_URL, MAILDEV_URL } = process.env

const email = 'test-ci@po.et'

const frostAccount = {
  email,
  password: 'aB%12345678910',
}

export const configuration = {
  mongodbUrl: MONGODB_URL || 'mongodb://localhost:27017/frost',
  frostUrl: FROST_URL || 'http://localhost:3000',
  maildevUrl: MAILDEV_URL || 'http://localhost:1080',
  frostAccount,
}
