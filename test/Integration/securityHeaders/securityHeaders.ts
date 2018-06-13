import { configuration } from 'test/Integration/configuration'
import { expect } from 'test/utils/expect'
const { frostUrl } = configuration

const features = [
  {
    value: 'content-security-policy',
    expected: `script-src 'self'`,
  },
  {
    value: 'x-frame-options',
    expected: 'DENY',
  },
  {
    value: 'x-xss-protection',
    expected: '1; mode=block',
  },
  {
    value: 'x-content-type-options',
    expected: 'nosniff',
  },
  {
    value: 'referrer-policy',
    expected: 'same-origin',
  },
]

describe('Security headers', async function() {
  features.forEach(async feature => {
    it(`Should be ${feature.expected} for the header ${feature.value}`, async () => {
      const result = await fetch(`${frostUrl}`, { cache: 'force-cache' })
      const value = result.headers.get(feature.value)
      expect(value).to.eql(feature.expected)
    })
  })
})
