import fetch from 'node-fetch'
import { createClaim } from '../PoetNode/Helpers/Claim'
import { WorkAttributes, ClaimType } from '../PoetNode/Interfaces/Interfaces'
import { Method } from '../Route/Route'

const url = 'http://localhost:8080'

export class WorksController {
  private work: WorkAttributes
  private privateKey: string

  constructor(privateKey: string, work: WorkAttributes) {
    this.privateKey = privateKey
    this.work = work
  }

  generateClaim() {
    return createClaim(this.privateKey, ClaimType.Work, this.work)
  }

  async create(workAttributes: any) {
    try {
      const createWork = await fetch(url + '/works/', {
        method: Method.POST,
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(workAttributes)
      })

      await createWork.text()

      if (!createWork.ok) throw new Error('')
    } catch (e) {
      throw e
    }
  }
}
