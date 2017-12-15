import fetch from 'node-fetch'
import { configuration } from '../../configuration'
import { createClaim } from '../../utils/PoetNode/Helpers/Claim'
import {
  WorkAttributes,
  ClaimType
} from '../../utils/PoetNode/Interfaces/Interfaces'
import { Method } from '../../utils/Route/Route'

const { poetUrl } = configuration

export class WorksController {
  private work: WorkAttributes
  private privateKey: string

  constructor(privateKey?: string, work?: WorkAttributes) {
    this.privateKey = privateKey
    this.work = work
  }

  generateClaim() {
    return createClaim(this.privateKey, ClaimType.Work, this.work)
  }

  async create(workAttributes: any) {
    try {
      const createWork = await fetch(poetUrl + '/works/', {
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

  async get(workId: string) {
    try {
      const work = await fetch(`${poetUrl}/works/${workId}`)

      if (work.ok) return await work.json()

      throw new Error('Work not found')
    } catch (e) {
      throw e
    }
  }
}
