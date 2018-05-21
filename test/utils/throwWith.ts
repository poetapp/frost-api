import * as Chai from 'chai'
import { sanetizeText } from 'test/utils/utils'

export const throwWith = (chai: any, utils: any) => {
  const Assertion = chai.Assertion
  Assertion.addMethod('throwWith', async function(expectation: any) {
    const methodPromise = this._obj

    try {
      await Promise.resolve(methodPromise)
      this.assert.fail()
    } catch (error) {
      this.assert(
        sanetizeText(expectation) === sanetizeText(error),
        `expected a string with: ${expectation}`,
        '',
        expectation,
        error
      )
    }
  })
}

Chai.use(throwWith)
export const expect = Chai.expect
