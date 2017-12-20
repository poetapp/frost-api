import * as VaultLib from 'node-vault'
import { Options } from './Options'

export namespace Vault {
  export function config(options?: Options) {
    this.vault = VaultLib(options)
  }

  export function getInstance(options?: Options) {
    return this.vault
  }

  export async function init() {
    return await this.vault.init({ secret_shares: 1, secret_threshold: 1 })
  }

  export async function unseal(key: string) {
    return await this.vault.unseal({ secret_shares: 1, key })
  }

  export async function encrypt(text: string) {
    const plaintext = new Buffer(text).toString('base64')
    const encrypted = await this.vault.write('transit/encrypt/frost', {
      plaintext
    })
    return encrypted.data.ciphertext
  }

  export async function decrypt(ciphertext: string) {
    const decrypted = await this.vault.write('transit/decrypt/frost', {
      ciphertext
    })
    return new Buffer(decrypted.data.plaintext, 'base64').toString('ascii')
  }

  export async function createToken(options?: object) {
    return await this.vault.tokenCreate(options)
  }

  export async function verifyToken(token: string) {
    return await this.vault.tokenLookup({ token })
  }

  export async function readSecret(key: string) {
    return await this.vault.read(`secret/${key}`)
  }

  export async function writeSecret(key: string, value: object) {
    return await this.vault.write(`secret/${key}`, value)
  }

  export async function mountSecret() {
    await this.vault.mounts()
    return await this.vault.mount({
      mount_point: 'secret',
      type: 'generic',
      description: 'secrets'
    })
  }

  export async function mountTransit() {
    await this.vault.mounts()
    return await this.vault.mount({
      mount_point: 'transit',
      type: 'transit',
      description: 'transit'
    })
  }

  export async function writeTransitKey() {
    return await this.vault.write('transit/keys/frost')
  }
}
