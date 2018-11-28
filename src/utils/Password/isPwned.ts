const crypto = require('crypto')
import fetch from 'node-fetch'

const sha1sum = (password: string) =>
  crypto
    .createHash('sha1')
    .update(password)
    .digest('hex')

const runPwnedChecker = (root: string) => async (password: string) => fetch(`${root}/${sha1sum(password)}`)
export const result = ({ status }: { [key: string]: any }) => Promise.resolve(status === 200)
const asyncPipe = (...fns: any[]) => (x: any) => fns.reduce(async (y: any, f: any) => f(await y), x)

export const isPwned = async (password: string, root: string) => {
  try {
    return await asyncPipe(runPwnedChecker(root), result)(password)
  } catch (err) {
    return false
  }
}
