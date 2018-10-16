const { pipe } = require('ramda')
import * as bitcoin from 'bitcoinjs-lib'
import { processPassword } from '../../utils/Password'
import { Vault } from '../../utils/Vault/Vault'

const createKeys = (): { privateKey: string; publicKey: string } => {
  const keyPair = bitcoin.ECPair.makeRandom()
  const privateKey = keyPair.privateKey.toString('hex')
  const publicKey = keyPair.publicKey.toString('hex')

  return {
    privateKey,
    publicKey,
  }
}

export const createCryptoKeys = (obj: any) => ({ ...obj, ...createKeys() })
export const setVerifiedAccountStatus = (verified: boolean = false) => (obj: any) => ({
  ...obj,
  verified,
})

export const validate = (verifiedAccount: boolean, pwnedCheckerRoot: string) =>
  async function(next: any) {
    if (this.isNew) {
      const { verified, privateKey, publicKey } = pipe(
        createCryptoKeys,
        setVerifiedAccountStatus(verifiedAccount)
      )({})

      this.verified = verified
      this.publicKey = publicKey
      this.privateKey = await Vault.encrypt(privateKey)
      this.password = await processPassword(this.password, pwnedCheckerRoot)
      this.createdAt = Date.now()
    }

    next()
  }
