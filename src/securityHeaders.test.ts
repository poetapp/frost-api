import { describe } from 'riteway'
import { securityHeaders } from './securityHeaders'

describe('Security headers', async (assert: any) => {
  {
    assert({
      given: 'an object with security header configuration',
      should: 'have the frameguard action set to "deny"',
      actual: securityHeaders.frameguard.action,
      expected: 'deny',
    })
  }

  {
    assert({
      given: 'an object with security header configuration',
      should: 'have the referrer policy set to "same-origin"',
      actual: securityHeaders.referrerPolicy.policy,
      expected: 'same-origin',
    })
  }

  {
    assert({
      given: 'an object with security header configuration',
      should: 'have the content security policy scriptSrc set to "self"',
      actual: securityHeaders.contentSecurityPolicy.directives.scriptSrc,
      expected: ['\'self\''],
    })
  }
})
