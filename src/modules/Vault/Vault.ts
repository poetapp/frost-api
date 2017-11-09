import * as VaultLib from 'node-vault'
import { Options } from './Options'

export namespace Vault {
  export function config(options?: Options) {
    this.vault = VaultLib(options)
  }

  export function getInstance(options?: Options) {
    return this.vault
  }

  export async function encrypt(text: string) {
    const plaintext = new Buffer(text).toString('base64')
    const encrypted = await this.vault.write('transit/encrypt/usertransit', {
      plaintext
    })
    return encrypted.data.ciphertext
  }

  export async function decrypt(ciphertext: string) {
    const decrypted = await this.vault.write('transit/decrypt/usertransit', {
      ciphertext
    })
    return new Buffer(decrypted.data.plaintext, 'base64').toString('ascii')
  }

  export async function createToken(options?: object) {
    return this.vault.tokenCreate(options)
  }

  export async function verifyToken(token: string) {
    return this.vault.tokenLookup({ token })
  }

  export async function readSecret(key: string) {
    return await this.vault.read(`secret/${key}`)
  }
}
