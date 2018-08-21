import { describe } from 'riteway'
import { spy } from 'sinon'
import { injectDao } from './injectDao'

describe('injectDao', async (should: any) => {
  const { assert } = should()

  const fnSpy = spy()

  // tslint:disable:max-classes-per-file
  class Bar {
    bar() {
      fnSpy()
    }
  }

  @injectDao(Bar)
  class Foo {
    private readonly dao: Bar

    public test() {
      this.dao.bar()
    }
  }

  const myFoo = new Foo()

  myFoo.test()

  assert({
    given: 'two classes',
    should: 'adds an instance of one class to an instance of the other at "prototype.dao"',
    actual: fnSpy.calledOnce,
    expected: true,
  })
})
