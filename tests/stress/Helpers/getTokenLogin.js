import http from 'k6/http'

export const getTokenLogin = () => {
  const suffix = Date.now()
  const payload = JSON.stringify({
    email: `test${suffix}@po.et`,
    password: 'aB%12345678910'
  })

  const url = `${FROST_HOST}/accounts`
  const params =  { headers: { 'Content-Type': 'application/json' } }
  const res = http.post(url, payload, params)

  return res.json().token
}
