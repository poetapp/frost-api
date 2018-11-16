import http from 'k6/http'
import { check, sleep } from 'k6'

import { getTokenLogin } from './Helpers/getTokenLogin.js'

const FROST_HOST = __ENV.FROST_HOST || 'http://0.0.0.0:3000'

export const setup = () => getTokenLogin()

export default (token) => {
  const url = `${FROST_HOST}/accounts/profile`
  const params =  { headers: { 'Content-Type': 'application/json', token } }
  const res = http.get(url, params)

  check(res, {
    'status 200': (r) => r.status === 200
  })

  sleep(1)
}
