import * as uuidv4 from 'uuid/v4'

export const uuid4 = () => {
  const id = Buffer.alloc(16)
  uuidv4(null, id)
  return id
}
