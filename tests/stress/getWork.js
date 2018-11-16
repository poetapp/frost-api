import http from 'k6/http'
import { check, sleep } from 'k6'
import { createWork } from './Helpers/createWork.js'

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

  const { token } = res.json()

  const work = JSON.stringify(createWork())
  const urlWorks = `${FROST_HOST}/works`
  const paramsWorks =  { headers: { 'Content-Type': 'application/json', token } }
  const resWorks = http.post(urlWorks, work, paramsWorks)
  const workId = resWorks.json().workId

  return { workId, token }
}

export default ({ token, workId }) => {
  const url = `${FROST_HOST}/works/${workId}`
  const params =  { headers: { 'Content-Type': 'application/json', token } }
  const res = http.get(url, params)

  check(res, {
    'status 200': (r) => r.status === 200
  })

  sleep(1)
}