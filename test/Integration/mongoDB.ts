import { MongoClient } from 'mongodb'
import { configuration } from './configuration'
export class MongoDB {
  private url: string

  constructor() {
    this.url = configuration.mongodbUrl
  }

  connect() {
    return MongoClient.connect(this.url)
  }
}
