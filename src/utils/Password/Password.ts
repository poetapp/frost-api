import SecurePassword = require('secure-password')

import { isPwned } from './isPwned'

const UNSAFE = 'Password is not safe'

const securePassword = new SecurePassword()

export const processPassword = (password: string, root: string) =>
  Promise.all([
    isPwned(password, root),
    securePassword.hash(Buffer.from(password)),
  ]).then(([isUnsafe, hashedPassword]) => {
    if (isUnsafe) throw new Error(UNSAFE)
    return hashedPassword.toString()
  })

export const passwordMatches = async (password: string, hash: string): Promise<boolean> => {
  const userPassword = Buffer.from(password)
  const hashBuffer = Buffer.from(hash)
  return await securePassword.verify(userPassword, hashBuffer) === SecurePassword.VALID
}
