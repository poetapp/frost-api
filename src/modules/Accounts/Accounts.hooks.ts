const { PrivateKey } = require('bitcore-lib')
import { configuration } from '../../configuration'
import { validate as validatePassword } from '../../utils/Password'
import { Vault } from '../../utils/Vault/Vault'

const createKeys = (): { privateKey: string; publicKey: string } => {
  const key = new PrivateKey()
  const privateKey = key.toWIF()
  const publicKey = new PrivateKey(privateKey).publicKey.toString()
  return { privateKey, publicKey }
}

export const validate = async function(next: any) {
  if (this.isNew) {
    const { privateKey, publicKey } = createKeys()
    this.createdAt = Date.now()
    this.privateKey = await Vault.encrypt(privateKey)
    this.password = await validatePassword(this.password)
    this.verified = configuration.verifiedAccount
    this.publicKey = publicKey
  }
  next()
}
