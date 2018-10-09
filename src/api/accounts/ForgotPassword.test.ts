import { describe } from 'riteway'
import { setResponseStatus } from './ForgotPassword'

describe('setResponseStatus()', async (assert: any) => {
  assert({
    given: 'an argument of false',
    should: 'return 400',
    actual: setResponseStatus(false),
    expected: 400,
  })

  assert({
    given: 'an argument of true',
    should: 'return 200',
    actual: setResponseStatus(true),
    expected: 200,
  })
})
