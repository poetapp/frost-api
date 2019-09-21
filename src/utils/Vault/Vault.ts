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
    return this.vault.init({ secret_shares: 1, secret_threshold: 1 })
  }

  export async function unseal(key: string) {
    return this.vault.unseal({ secret_shares: 1, key })
  }

  export async function encrypt(text: string): Promise<string> {
    const plaintext = Buffer.from(text).toString('base64')
    const encrypted = await this.vault.write('transit/encrypt/frost', {
      plaintext,
    })
    return encrypted.data.ciphertext
  }

  export async function decrypt(ciphertext: string) {
    const decrypted = await this.vault.write('transit/decrypt/frost', {
      ciphertext,
    })
    return Buffer.from(decrypted.data.plaintext, 'base64').toString('ascii')
  }

  export async function createToken(options?: object) {
    return this.vault.tokenCreate(options)
  }

  export async function revokeToken(token: string) {
    return this.vault.tokenRevokeOrphan({ token })
  }

  export async function verifyToken(token: string) {
    return this.vault.tokenLookup({ token })
  }

  export async function mountTransit() {
    await this.vault.mounts()
    return this.vault.mount({
      mount_point: 'transit',
      type: 'transit',
      description: 'transit',
    })
  }

  export async function mountAuthTune() {
    await this.vault.mounts()
    return this.vault.mount({
      mount_point: 'auth/token/tune',
      type: 'auth',
      description: 'auth tune',
      default_lease_ttl: 720,
      max_lease_ttl: 4611686018, // ~146 years
      force_no_cache: false,
    })
  }

  export async function status() {
    return this.vault.health()
  }

  export async function writeTransitKey() {
    return this.vault.write('transit/keys/frost')
  }
}
