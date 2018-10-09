import { describe } from 'riteway'
import { template } from './verify'

describe('verify', async (assert: any) => {
  const link = 'the.verify/link/for/passwords'
  const pattern = new RegExp(`href="${link}"`)
  const actual = pattern.test(template(link))

  assert({
    given: 'a template and a link for verifying the user password',
    should: 'return the link in the template output',
    actual,
    expected: true,
  })
})
