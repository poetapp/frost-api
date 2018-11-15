import http from 'k6/http'
import { check, sleep } from 'k6'

const FROST_HOST = __ENV.FROST_HOST || 'http://0.0.0.0:3000'

const account = JSON.stringify({
  email: `test-login@po.et`,
  password: 'aB%12345678910'
})

export const setup = () => {
  const url = `${FROST_HOST}/accounts`
  const params =  { headers: { 'Content-Type': 'application/json' } }
  http.post(url, account, params)
}

export default () => {
  const url = `${FROST_HOST}/login`
  const params =  { headers: { 'Content-Type': 'application/json' } }
  const res = http.post(url, account, params)

  check(res, {
    'status 200': (r) => r.status === 200
  })

  sleep(1)
}
