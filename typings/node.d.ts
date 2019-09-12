declare module 'crypto' {
  interface Cipher {
    getAuthTag: () => Buffer
  }
  interface Decipher {
    setAuthTag: (authTag: Buffer) => void
  }
}
