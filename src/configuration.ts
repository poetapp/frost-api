const { MONGODB_URL, VAULT_URL, VAULT_TOKEN, POET_URL } = process.env

export const configuration = {
  mongodbUrl: MONGODB_URL || 'mongodb://localhost:27017/frost',
  vaultUrl: VAULT_URL || 'http://localhost:8200',
  vaultToken: VAULT_TOKEN || 'frost',
  poetUrl: POET_URL || 'http://localhost:18080'
}
