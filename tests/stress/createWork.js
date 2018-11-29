import http from 'k6/http'
import { check, sleep } from 'k6'

import { createWork } from './Helpers/createWork.js'
import { getTokenLogin } from './Helpers/getTokenLogin.js'

const FROST_HOST = __ENV.FROST_HOST || 'http://0.0.0.0:3000'

export const setup = () => {
  const token = getTokenLogin()

  const content = `${Date.now()} - VU: ${__VU}  -  ITER: ${__ITER}`
  const work = JSON.stringify(createWork({ content }))

  return { token, work }
}

export default ({ token, work }) => {
  const url = `${FROST_HOST}/works`
  const params =  { headers: { 'Content-Type': 'application/json', token } }
  const res = http.post(url, work, params)

  check(res, {
    'status 200': (r) => r.status === 200
  })

  sleep(1)
}
