const securePassword = require('secure-password')

export class Argon2 {
  private password: string
  private pwd: any

  constructor(password?: string) {
    this.password = password
    this.pwd = securePassword()
  }

  public hash() {
    const userPassword = Buffer.from(this.password)

    return new Promise((resolve, reject) => {
      this.pwd.hash(userPassword, (err: any, hash: string) => {
        return err ? reject(err) : resolve(hash)
      })
    }).catch(e => {
      throw e
    })
  }

  public verify(password: string, hash: string) {
    const userPassword = Buffer.from(password)
    const hashBuffer = Buffer.from(hash)
    return new Promise((resolve, reject) => {
      this.pwd.verify(userPassword, hashBuffer, (err: any, result: any) => {
        if (err) throw err

        return result === securePassword.VALID
          ? resolve(true)
          : reject({ status: 401, message: 'Unauthorized' })
      })
    }).catch(e => {
      throw e
    })
  }
}
