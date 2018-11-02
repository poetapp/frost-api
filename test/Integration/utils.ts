import { Frost } from '@po.et/frost-client'
import { load } from 'cheerio'

export const createUserVerified = async (mail: any, frost: Frost) => {
  const user = await frost.create()

  const [email] = await mail.getEmails()
  const html: string = email.html

  const $ = load(html)
  const link = $('#verify-link').attr('href')
  const token = link.split('token=').reverse()[0]

  await frost.verifyAccount(token)

  return user
}

export const createWork = ({ content = 'test' } = {}): any => {
  return {
    name: 'test',
    datePublished: '2017-11-24T00:38:41.595Z',
    dateCreated: '2017-11-24T00:38:41.595Z',
    author: 'test',
    tags: '1,1,1',
    content,
  }
}

export const createWorkWrong = (): any => {
  return {
    name: 'test',
    datePublished: 'aaaa',
    dateCreated: '2017-11-24T00:38:41.595Z',
    author: 'test',
    tags: '1,1,1',
    content: 'test',
  }
}

export const createWorkNoTags = (): any => {
  return {
    name: 'test',
    datePublished: '2017-11-24T00:38:41.595Z',
    dateCreated: '2017-11-24T00:38:41.595Z',
    author: 'test',
    content: 'test',
  }
}

export const createWorkNoText = (): any => ({
  name: 'test',
  datePublished: '2017-11-24T00:38:41.595Z',
  dateCreated: '2017-11-24T00:38:41.595Z',
  author: 'test',
  tags: '1,1,1',
})

export const createWorkArchiveUrlHash = (archiveUrl: string = 'http://archive.example.com'): any => ({
  name: 'test',
  datePublished: '2017-11-24T00:38:41.595Z',
  dateCreated: '2017-11-24T00:38:41.595Z',
  author: 'test',
  tags: '1,1,1',
  hash: 'this-is-a-hash',
  archiveUrl,
})

export const createWorkEmptyTags = (): any => {
  return {
    name: 'test',
    datePublished: '2017-11-24T00:38:41.595Z',
    dateCreated: '2017-11-24T00:38:41.595Z',
    author: 'test',
    content: 'test',
    tags: '',
  }
}

export const getDataVerifiedAccount = async (mail: any) => {
  // Receiving email 'Po.et Verify account'
  const [email] = await mail.getEmails()
  const html: string = email.html

  const $ = load(html)
  const link = $('#verify-link').attr('href')
  const token = link.split('token=').reverse()[0]
  return { token, email }
}

export const getTokenResetPassword = async (mail: any) => {
  // Receiving email 'Po.et Password Reset'
  const [email] = await mail.getEmails()
  const html: string = email.html
  const $ = load(html)
  const link = $('#change-password-link').attr('href')
  const token = link.split('token=').reverse()[0]
  return token
}

export const optionsGetWork = (token: string) => ({
  method: 'GET',
  headers: new Headers({
    'Content-Type': 'application/json',
    token,
  }),
})

export const optionsCreateWork = (token: string) => ({
  method: 'POST',
  headers: new Headers({
    'Content-Type': 'application/json',
    token,
  }),
  body: JSON.stringify(createWork()),
})

export const getHeader = (result: any, property: string) => {
  const headers = result.headers
  const value = headers.get(property)
  return value
}

export enum Method {
  POST = 'post',
  GET = 'get',
  PUT = 'put',
  DEL = 'delete',
  ALL = 'all',
}

export enum Network {
  LIVE = 'live',
  TEST = 'test',
}
