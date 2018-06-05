import { createClaim, WorkAttributes, ClaimType } from '@po.et/poet-js'
import fetch from 'node-fetch'
import { configuration } from '../../configuration'
import { errors } from '../../errors/errors'
import { logger } from '../../utils/Logger/Logger'
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
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(workAttributes),
      })

      if (createWork.ok) return await createWork.text()

      const errorText = await createWork.text()
      const data = { ...createWork, errorText, method: Method.POST }
      logger.error('WorksController.create', data, workAttributes)

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

      const errorText = await work.text()
      const data = { ...work, errorText, method: Method.GET }
      logger.error('WorksController.get', data, { workId })

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

      const errorText = await works.text()
      const data = { ...works, errorText, method: Method.GET }
      logger.error('WorksController.getWorksByPublicKey', data, { publicKey })

      throw new Error('Works not found')
    } catch (e) {
      logger.error('WorksController.getWorksByPublicKey', e)
      throw e
    }
  }
}
