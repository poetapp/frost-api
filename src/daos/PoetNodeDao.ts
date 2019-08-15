import { SignedVerifiableClaim } from '@po.et/poet-js'
import * as FormData from 'form-data'
import fetch from 'node-fetch'

import { WorkNotFound } from '../errors/errors'

export interface PoetNode {
  readonly getWorkById: (id: string) => Promise<SignedVerifiableClaim>
  readonly searchWorks: (params: WorkSearchFilters) => Promise<ReadonlyArray<SignedVerifiableClaim>>
  readonly postWork: (signedVerifiableClaim: SignedVerifiableClaim) => Promise<void>
  readonly postArchive: (archive: any) => Promise<ReadonlyArray<{ readonly hash: string, readonly archiveUrl: string }>>
}

export interface WorkSearchFilters {
  readonly issuer: string
}

const filtersToQueryParams = (filters: any) =>
  Object.entries(filters).map(([key, value]) => `${key}=${value}`).join('&')

export const PoetNode = (url: string): PoetNode => {
  const getWorkById = async (id: string) => {
    const response = await fetch(`${url}/works/${id}`)

    if (!response.ok) {
      if (response.status === 404)
        throw new WorkNotFound()
      throw new Error(await response.text())
    }

    return response.json()
  }

  const searchWorks = async (filters: WorkSearchFilters) => {
    const response = await fetch(`${url}/works?${filtersToQueryParams(filters)}`)

    if (!response.ok)
      throw new Error(await response.text())

    return response.json()
  }

  const postWork = async (signedVerifiableClaim: SignedVerifiableClaim): Promise<void> => {
    const response = await fetch(`${url}/works`, {
      method: 'post',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(signedVerifiableClaim),
    })

    if (!response.ok)
      throw new Error(await response.text())
  }

  const postArchive = async (archive: ReadableStream | string) => {
    const formData = new FormData()
    formData.append('content', archive, {
      filepath: 'content',
      ...(typeof archive === 'string' && {
        filename: 'content',
        knownLength: Buffer.from(archive).length,
        contentType: 'plain/text',
      }),
    })

    const response = await fetch(`${url}/files`, {
      method: 'post',
      body: formData,
    })

    if (!response.ok)
      throw new Error(await response.text())

    return response.json()
  }

  return {
    getWorkById,
    searchWorks,
    postWork,
    postArchive,
  }
}
