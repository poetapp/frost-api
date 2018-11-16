import http from 'k6/http'
import { check, sleep } from 'k6'

const FROST_HOST = __ENV.FROST_HOST || 'http://0.0.0.0:3000'

export const setup = () => {
  const suffix = Date.now()
  const payload = JSON.stringify({
    email: `test${suffix}@po.et`,
    password: 'aB%12345678910'
  })

  const url = `${FROST_HOST}/accounts`
  const params =  { headers: { 'Content-Type': 'application/json' } }
  const res = http.post(url, payload, params)
  return res.json()
}

export default (data) => {
  const url = `${FROST_HOST}/works`
  const params =  { headers: { 'Content-Type': 'application/json', token: data.token } }
  const res = http.get(url, params)

  check(res, {
    'status 200': (r) => r.status === 200
  })

  sleep(1)
}
