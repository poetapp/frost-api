import { expect } from 'chai'
import { configuration } from 'test/Integration/configuration'

const { frostUrl } = configuration

export enum Method {
  GET = 'get',
}

describe('Health', function() {
  describe('When get health endpoint', function() {
    const options = {
      method: Method.GET,
      headers: new Headers({
        'Content-Type': 'application/json',
      }),
    }
    it('Should return status === 200', async function() {
      const result = await fetch(`${frostUrl}/health`, options)
      expect(result.status === 200)
    })
  })
})
