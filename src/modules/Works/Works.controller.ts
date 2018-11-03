import {
  getVerifiableClaimSigner,
  configureCreateVerifiableClaim,
  createIssuerFromPrivateKey,
  SignedVerifiableClaim,
} from '@po.et/poet-js'
import * as FormData from 'form-data'
import fetch from 'node-fetch'
import * as Pino from 'pino'
import { isNil, not, pipe, pipeP } from 'ramda'
import { Readable } from 'stream'

import { Method } from '../../constants'
import { errors } from '../../errors/errors'

const legacyContext = {
  content: 'schema:text',
}

const isNotNil = pipe(
  isNil,
  not,
)

export class WorksController {
  private work: object
  private network: string
  private issuer: string
  private privateKey: string
  private createAndSignClaim: (doc: object) => SignedVerifiableClaim
  private logger: Pino.Logger

  constructor(createLogger: (dirname: string) => Pino.Logger, network: string, privateKey?: string, work?: object) {
    this.logger = createLogger(__dirname)
    this.work = work
    this.network = network
    this.privateKey = privateKey
    if (isNotNil(privateKey)) this.issuer = createIssuerFromPrivateKey(privateKey)
  }

  start() {
    this.createAndSignClaim = pipeP(
      configureCreateVerifiableClaim({ issuer: this.issuer, context: legacyContext }),
      getVerifiableClaimSigner().configureSignVerifiableClaim({ privateKey: this.privateKey }),
    )
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
      this.logger.error({ data, workAttributes }, 'WorksController.create')

      throw new Error(errors.InternalErrorExternalAPI.message)
    } catch (exception) {
      this.logger.error({ exception }, 'WorksController.create')
      throw exception
    }
  }

  private createReadableStream(content: string = '') {
    if (isNil(content) || content.length > 0) return
    return new Readable( {
      read() {
        this.push(content)
        this.push(null)
      },
    })
  }

  private async uploadContent(content: string = '') {
    if (isNil(content) || content.length > 0) return {}
    const streamedContent = this.createReadableStream(content)

    const formData = new FormData()
    formData.append('file-0', streamedContent)
    try {
      const response = await fetch(`${this.network}/files`, {
        method: 'post',
        body: formData,
      })

      if (response.ok) return response.json()

      const errorText = await response.text()
      const data = { ...response, errorText, method: Method.POST }
      this.logger.error({ data, content }, 'WorksController.uploadContent')

      throw new Error('Unable to upload content')
    } catch (exception) {
      this.logger.error({ exception }, 'WorksController.uploadContent')
      throw exception
    }
  }

  async get(workId: string) {
    try {
      const work = await fetch(`${this.network}/works/${workId}`)

      if (work.ok) return await work.json()

      const errorText = await work.text()
      const data = { ...work, errorText, method: Method.GET }
      this.logger.error({ data, workId }, 'WorksController.get')

      throw new Error('Work not found')
    } catch (exception) {
      this.logger.error({ exception }, 'WorksController.get')
      throw exception
    }
  }

  async getWorksByIssuer() {
    try {
      const works = await fetch(`${this.network}/works/?issuer=${this.issuer}`)

      if (works.ok) return await works.json()

      const errorText = await works.text()
      const data = { ...works, errorText, method: Method.GET }
      this.logger.error({ data, issuer: this.issuer }, 'WorksController.getWorksByIssuer')

      throw new Error('Works not found')
    } catch (exception) {
      this.logger.error({ exception }, 'WorksController.getWorksByIssuer')
      throw exception
    }
  }
}
