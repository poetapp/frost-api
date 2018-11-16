import fetch from 'node-fetch'
import { Path } from '../../src/api/Path'
import { FROST_URL } from '../helpers/utils'

export const createUser = async (email: string, password: string): Promise<{ readonly token: string }> => {
  const options = {
    method: 'post',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  }

  const request = await fetch(`${FROST_URL}${Path.ACCOUNTS}`, options)
  if (request.ok) return await request.json()
  throw await request.text()
}
