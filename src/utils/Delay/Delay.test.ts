import { describe } from 'riteway'
import { delay } from './Delay'

describe('Delay', async (should: any) => {
  const { assert } = should()
  let actual

  {
    try {
      await delay(10)
      actual = true
    } catch (err) {
      actual = false
    }

    assert({
      given: 'a time in milliseconds',
      should: 'resolve',
      actual,
      expected: true,
    })
  }
})
