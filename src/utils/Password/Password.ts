import SecurePassword = require('secure-password')

const securePassword = new SecurePassword()

export const passwordMatches = async (password: string, hash: string): Promise<boolean> => {
  const userPassword = Buffer.from(password)
  const hashBuffer = Buffer.from(hash)
  return await securePassword.verify(userPassword, hashBuffer) === SecurePassword.VALID
}
