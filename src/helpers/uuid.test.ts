import { describe } from 'riteway'
import { bytesToUuid, uuidToBytes } from './uuid'

describe('UUID Helper bytesToUuid', async (assert: any) => {
  {
    const buffer = Buffer.from('0TcPEar9Tt21TRB4lJzKGw==', 'base64')

    const uuid = bytesToUuid(buffer)

    assert({
      given: 'a buffer',
      should: 'transform to the expected uuid',
      actual: uuid,
      expected: 'd1370f11-aafd-4edd-b54d-1078949cca1b',
    })
  }
})

describe('UUID Helper uuidToBytes', async (assert: any) => {
  {
    const uuid = 'd1370f11-aafd-4edd-b54d-1078949cca1b'
    const buffer = uuidToBytes(uuid)

    assert({
      given: 'a buffer',
      should: 'transform to the expected uuid',
      actual: Array.from(buffer),
      expected: [ 209, 55, 15, 17, 170, 253, 78, 221, 181, 77, 16, 120, 148, 156, 202, 27 ],
    })
  }
})
