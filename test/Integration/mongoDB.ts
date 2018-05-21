import { MongoClient } from 'mongodb'
export class MongoDB {
  private url: string

  constructor() {
    this.url = 'mongodb://localhost:27017/frost'
  }

  connect() {
    return MongoClient.connect(this.url)
  }
}
