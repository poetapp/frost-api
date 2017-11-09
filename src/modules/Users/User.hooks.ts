const { PrivateKey } = require('bitcore-lib')
import { Argon2 } from '../Argon2/Argon2'
import { Vault } from '../Vault/Vault'

const createPrivateKey = (): string => {
  const privateKey = new PrivateKey()
  return privateKey.toWIF()
}

export const validate = async function(next: any) {
  const argon2 = new Argon2(this.password)
  this.createdAt = Date.now()
  this.privateKey = await Vault.encrypt(createPrivateKey())
  this.password = await argon2.hash()
  this.verified = false
  next()
}
