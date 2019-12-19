import uuidv4 from 'uuid/v4'

export const uuid4 = () => {
  const id = Buffer.alloc(16)
  uuidv4(null, id)
  return bytesToUuid(id)
}

export const bytesToUuid = (buffer: Buffer) =>
  buffer.toString('hex', 0, 4) + '-' +
  buffer.toString('hex', 4, 6) + '-' +
  buffer.toString('hex', 6, 8) + '-' +
  buffer.toString('hex', 8, 10) + '-' +
  buffer.toString('hex', 10)

export const uuidToBytes = (uuid: string) => Buffer.from(uuid.replace(/-/g, ''), 'hex')
