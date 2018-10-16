import { isPwned } from './isPwned'
const securePassword = require('secure-password')

export const INVALID = 'Invalid password'
const UNSAFE = 'Password is not safe'

export const hasher = (password: string) =>
  new Promise((resolve, reject) => {
    securePassword().hash(Buffer.from(password), (err: any, hash: string) => (err ? reject(err) : resolve(hash)))
  })

export const processPassword = (password: string, root: string) =>
  Promise.all([isPwned(password, root), hasher(password)]).then(([isUnsafe, hashedPassword]) => {
    if (isUnsafe) throw new Error(UNSAFE)
    return hashedPassword
  })

export const verify = (password: string, hash: string) => {
  const userPassword = Buffer.from(password)
  const hashBuffer = Buffer.from(hash)

  return new Promise((resolve, reject) => {
    securePassword().verify(userPassword, hashBuffer, (err: any, result: any) => {
      if (err) throw err
      result === securePassword.VALID ? resolve(true) : reject(INVALID)
    })
  })
}
