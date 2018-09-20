import { getOptions } from '@po.et/frost-client'
import { expect } from 'chai'
import { configuration } from 'test/Integration/configuration'
import { getHeader, Method } from 'test/Integration/utils'
const { frostUrl } = configuration

describe('Health CORS', function() {
  describe('When call health', function() {
    it('Should return Access-Control-Allow-Origin with *', async function() {
      const result = await fetch(`${frostUrl}/health`, getOptions(Method.GET))

      const actual = getHeader(result, 'Access-Control-Allow-Origin')
      const expected = '*'

      expect(actual).to.eq(expected)
    })
  })
})
