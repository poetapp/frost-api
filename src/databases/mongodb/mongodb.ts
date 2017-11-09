import * as mongoose from 'mongoose'
import { Options } from './Options'

export class MongoDB {
  private mongodbUri: string
  private options: Options

  constructor(mongodbUri: string, options: Options) {
    this.mongodbUri = mongodbUri
    this.options = options
  }

  public start() {
    return new Promise((resolve, reject) => {
      require('mongoose').Promise = this.options.promiseLibrary
      mongoose.connect(this.mongodbUri, this.options, error => {
        return error ? reject(error) : resolve()
      })
    }).catch(e => {
      throw e
    })
  }
}
