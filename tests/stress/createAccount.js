import http from 'k6/http'
import { check, sleep } from 'k6'

const FROST_HOST = __ENV.FROST_HOST || 'http://0.0.0.0:3000'

export default () => {
  const email = `user${Date.now()}+${__VU}@po.et`;
  const payload = JSON.stringify({ email, password: 'aB%12345678910' })

  const url = `${FROST_HOST}/accounts`
  const params =  { headers: { 'Content-Type': 'application/json' } }
  const res = http.post(url, payload, params)

  check(res, {
    'status 200': (r) => r.status === 200
  })

  sleep(1)
}
