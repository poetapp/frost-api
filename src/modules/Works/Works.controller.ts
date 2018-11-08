import {
  getVerifiableClaimSigner,
  configureCreateVerifiableClaim,
  createIssuerFromPrivateKey,
  SignedVerifiableClaim,
} from '@po.et/poet-js'
import * as FormData from 'form-data'
import fetch from 'node-fetch'
import * as Pino from 'pino'
import { isNil, not, omit, pipe, pipeP } from 'ramda'
import * as str from 'string-to-stream'

import { Method } from '../../constants'
import { errors } from '../../errors/errors'

const legacyContext = {
  content: 'schema:text',
}

const isNotNil = pipe(
  isNil,
  not,
)

export interface WorkAttributes {
  readonly [key: string]: string
}

export class WorksController {
  private work: WorkAttributes
  private network: string
  private issuer: string
  private privateKey: string
  private createAndSignClaim: (doc: object) => SignedVerifiableClaim
  private logger: Pino.Logger

  constructor(
    createLogger: (dirname: string) => Pino.Logger,
    network: string,
    privateKey?: string,
    work?: WorkAttributes,
  ) {
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
    const { archiveUrl, hash } = (await this.uploadContent(this.work.content))[0]
    const newWork = omit(['content'], this.work)
    return await this.createAndSignClaim({ ...newWork, archiveUrl, hash })
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

  private async uploadContent(content: string = '') {
    if (isNil(content) || content.length === 0) return [{}]
    const formData = new FormData()

    try {
      formData.append('content', str(content), {
        knownLength: Buffer.from(content).length,
        filename: 'content',
        contentType: 'plain/text',
      })

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
      const work = await fetch(`${this.network}/works/${workId}`)

      if (work.ok) return await work.json()

      const errorType = 'Work not found'
      const data = { ...work, errorType, method: Method.GET }
      this.logger.error({ data, workId }, 'WorksController.get')

      throw new Error(errorType)
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
