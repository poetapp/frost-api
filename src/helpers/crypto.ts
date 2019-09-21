import { createCipheriv, createDecipheriv, randomBytes } from 'crypto'

const algorithm = 'id-aes256-GCM'
const ivLengthInBytes = 96

export const encrypt = (key: string) => (text: string): string => {
  const iv = randomBytes(ivLengthInBytes)
  const cipher = createCipheriv(algorithm, Buffer.from(key, 'hex'), iv)
  const ciphertext = cipher.update(text, 'utf8', 'hex') + cipher.final('hex')
  const authTag = cipher.getAuthTag().toString('hex')
  return ciphertext + '|' + authTag + '|' + iv.toString('hex')
}

export const decrypt = (ciphertextWithAuthTagAndIv: string, key: string): string => {
  const [ciphertext, authTagHex, ivHex] = ciphertextWithAuthTagAndIv.split('|')
  const decipher = createDecipheriv(algorithm, Buffer.from(key, 'hex'), Buffer.from(ivHex, 'hex'))
  decipher.setAuthTag(Buffer.from(authTagHex, 'hex'))
  return decipher.update(ciphertext, 'hex').toString('utf8') + decipher.final('utf8')
}
