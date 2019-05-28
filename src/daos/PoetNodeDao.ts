import * as FormData from 'form-data'
import fetch from 'node-fetch'

export interface PoetNode {
  readonly postArchive: (archive: any) => Promise<ReadonlyArray<{ readonly hash: string, readonly archiveUrl: string }>>
}

export const PoetNode = (url: string): PoetNode => {
  const postArchive = async (archive: any) => {
    const formData = new FormData()
    formData.append('content', archive, { filepath: 'content' })

    const response = await fetch(`${url}/files`, {
      method: 'post',
      body: formData,
    })

    if (!response.ok)
      throw new Error(await response.text())

    return response.json()
  }

  return {
    postArchive,
  }
}
