import SecurePassword = require('secure-password')

export interface PasswordHelper {
  readonly hash: (s: string) => Promise<string>
  readonly passwordMatches: (password: string, hash: string) => Promise<boolean>
}

export const PasswordHelper = (): PasswordHelper => {
  const securePassword = new SecurePassword()

  const hash = (s: string) => securePassword.hash(Buffer.from(s)).then(_ => _.toString())

  const passwordMatches = async (password: string, hash: string): Promise<boolean> => {
    const userPassword = Buffer.from(password)
    const hashBuffer = Buffer.from(hash)
    return await securePassword.verify(userPassword, hashBuffer) === SecurePassword.VALID
  }
  return {
    hash,
    passwordMatches,
  }
}
