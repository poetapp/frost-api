const { MONGODB_URL, VAULT_URL, VAULT_TOKEN, POET_URL, FROST_URL } = process.env

export const configuration = {
  vaultToken: VAULT_TOKEN || undefined,
  vaultUrl: VAULT_URL || 'http://localhost:8200',
  mongodbUrl: MONGODB_URL || 'mongodb://localhost:27017/frost',
  poetUrl: POET_URL || 'http://localhost:18080',
  frostUrl: FROST_URL || 'http://localhost:3000',
  transactionalMandrill: '46mwv_E6dOxrSDUkJD4NOQ',
  jwt: 'frost',
  passwordComplex: {
    min: 10,
    max: 30,
    lowerCase: 1,
    upperCase: 1,
    numeric: 1,
    symbol: 1
  }
}
