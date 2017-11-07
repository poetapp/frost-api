import * as mongoose from 'mongoose'
import IOptions from './IOptions'

export default class MongoDB {
  private mongodbUri: string
  private options: IOptions

  constructor(mongodbUri: string, options: IOptions) {
    this.mongodbUri = mongodbUri
    this.options = options
  }

  public start() {
    return new Promise((resolve, reject) => {
      const db = mongoose.connect(this.mongodbUri, this.options, error => {
        return error ? reject(error) : resolve()
      })
    })
  }
}
