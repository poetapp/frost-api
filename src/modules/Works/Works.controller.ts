import fetch from 'node-fetch'
import { configuration } from '../../configuration'
import { errors } from '../../errors/errors'
import { logger } from '../../utils/Logger/Logger'
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

      if (createWork.ok) return await createWork.text()

      logger.error('WorksController.create', createWork)
      throw new Error(errors.InternalErrorExternalAPI.message)
    } catch (e) {
      logger.error('WorksController.create', e)
      throw e
    }
  }

  async get(workId: string) {
    try {
      const work = await fetch(`${poetUrl}/works/${workId}`)

      if (work.ok) return await work.json()

      logger.error('WorksController.get', work)
      throw new Error('Work not found')
    } catch (e) {
      logger.error('WorksController.get', e)
      throw e
    }
  }

  async getWorksByPublicKey(publicKey: string) {
    try {
      const works = await fetch(`${poetUrl}/works/?publicKey=${publicKey}`)

      if (works.ok) return await works.json()

      logger.error('WorksController.getWorksByPublicKey', works)
      throw new Error('Works not found')
    } catch (e) {
      logger.error('WorksController.getWorksByPublicKey', e)
      throw e
    }
  }
}
