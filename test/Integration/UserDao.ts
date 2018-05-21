import { MongoDB } from './mongoDB'

export const deleteUser = async (email: string) => {
  const mongoClient = await new MongoDB().connect()
  const db = await mongoClient.db()
  return await db.collection('accounts').remove({ email })
}
