import {
  getVerifiableClaimSigner,
  configureCreateVerifiableClaim,
  createIssuerFromPrivateKey,
  SignedVerifiableClaim,
} from '@po.et/poet-js'
import fetch from 'node-fetch'
import { isNil, not, pipe, pipeP } from 'ramda'

import { Method } from '../../constants'
import { errors } from '../../errors/errors'
import { logger } from '../../utils/Logger/Logger'

const legacyContext = {
  text: 'schema:text',
  content: 'schema:text',
}

const isNotNil = pipe(
  isNil,
  not
)

export class WorksController {
  private work: object
  private network: string
  private issuer: string
  private createAndSignClaim: (doc: object) => SignedVerifiableClaim

  constructor(network: string, privateKey?: string, work?: object) {
    this.work = work
    this.network = network
    if (isNotNil(privateKey)) {
      this.issuer = createIssuerFromPrivateKey(privateKey)
      this.createAndSignClaim = pipeP(
        configureCreateVerifiableClaim({ issuer: this.issuer, context: legacyContext }),
        getVerifiableClaimSigner().configureSignVerifiableClaim({ privateKey })
      )
    }
  }

  async generateClaim() {
    return await this.createAndSignClaim(this.work)
  }

  async create(workAttributes: any) {
    try {
      const createWork = await fetch(this.network + '/works/', {
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
      const work = await fetch(`${this.network}/works/${workId}`)

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

  async getWorksByIssuer() {
    try {
      const works = await fetch(`${this.network}/works/?issuer=${this.issuer}`)

      if (works.ok) return await works.json()

      const errorText = await works.text()
      const data = { ...works, errorText, method: Method.GET }
      logger.error('WorksController.getWorksByIssuer', data, { issuer: this.issuer })

      throw new Error('Works not found')
    } catch (e) {
      logger.error('WorksController.getWorksByIssuer', e)
      throw e
    }
  }
}
