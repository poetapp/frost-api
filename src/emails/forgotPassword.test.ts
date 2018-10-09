import { describe } from 'riteway'
import { template } from './forgotPassword'

describe('forgotPassword', async (assert: any) => {
  const link = 'the.reset/link/for/passwords'
  const pattern = new RegExp(`href="${link}"`)
  const actual = pattern.test(template(link))

  assert({
    given: 'a template and a link for resetting the user password',
    should: 'return the link in the template output',
    actual,
    expected: true,
  })
})
