const { PrivateKey } = require('bitcore-lib')
import { configuration } from '../../configuration'
import { Argon2 } from '../../utils/Argon2/Argon2'
import { Vault } from '../../utils/Vault/Vault'

const createKeys = (): { privateKey: string; publicKey: string } => {
  const key = new PrivateKey()
  const privateKey = key.toWIF()
  const publicKey = new PrivateKey(privateKey).publicKey.toString()
  return { privateKey, publicKey }
}

export const validate = async function(next: any) {
  const { privateKey, publicKey } = createKeys()
  const argon2 = new Argon2(this.password)
  this.createdAt = Date.now()
  this.privateKey = await Vault.encrypt(privateKey)
  this.password = await argon2.hash()
  this.verified = configuration.verifiedAccount
  this.publicKey = publicKey
  next()
}
