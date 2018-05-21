import { Frost } from '@po.et/frost-client'
import { WorkAttributes } from '@po.et/poet-js'
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

export const createWork = ({ content = 'test' } = {}): WorkAttributes => {
  return {
    name: 'test',
    datePublished: '2017-11-24T00:38:41.595Z',
    dateCreated: '2017-11-24T00:38:41.595Z',
    author: 'test',
    tags: '1,1,1',
    content,
  }
}

export const createWorkWrong = (): WorkAttributes => {
  return {
    name: 'test',
    datePublished: 'aaaa',
    dateCreated: '2017-11-24T00:38:41.595Z',
    author: 'test',
    tags: '1,1,1',
    content: 'test',
  }
}

export const createWorkNoTags = (): WorkAttributes => {
  return {
    name: 'test',
    datePublished: '2017-11-24T00:38:41.595Z',
    dateCreated: '2017-11-24T00:38:41.595Z',
    author: 'test',
    content: 'test',
  }
}

export const createWorkEmptyTags = (): WorkAttributes => {
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
