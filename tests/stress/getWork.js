import http from 'k6/http'
import { check, sleep } from 'k6'

import { createWork } from './Helpers/createWork.js'
import { getTokenLogin } from './Helpers/getTokenLogin.js'

const FROST_HOST = __ENV.FROST_HOST || 'http://0.0.0.0:3000'

const getWorkId = (token) => {
  const work = JSON.stringify(createWork())
  const urlWorks = `${FROST_HOST}/works`
  const paramsWorks =  { headers: { 'Content-Type': 'application/json', token } }
  const resWorks = http.post(urlWorks, work, paramsWorks)
  return resWorks.json().workId
}

export const setup = () => {
  const token = getTokenLogin()
  const workId = getWorkId(token)

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