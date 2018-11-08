import { spy } from 'sinon'

export const logger = (x: any) => ({ error: spy() })
