import { generateED25519Base58Keys } from '@po.et/poet-js'
const { pipe } = require('ramda')
import { processPassword } from '../../utils/Password'
import { Vault } from '../../utils/Vault/Vault'

export const createCryptoKeys = (obj: any) => ({ ...obj, ...generateED25519Base58Keys() })
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
