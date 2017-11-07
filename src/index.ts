import * as Koa from 'koa'
import { connect, connection, model, Schema } from 'mongoose'

const mongodbUri = 'mongodb://localhost:27017/test'

const options = {
  useMongoClient: true,
  socketTimeoutMS: 0,
  keepAlive: true,
  reconnectTries: 30
}

const db = connect(mongodbUri, options)

const thingSchema = new Schema({
  name: String
})
const Thing = model('Thing', thingSchema)
const thing = new Thing({ name: 'test' })
thing.save() // iAmNotInTheSchema is not saved to the db

const app = new Koa()

// response
app.use(ctx => {
  ctx.body = 'Hello Koa'
})

app.listen(3000)
