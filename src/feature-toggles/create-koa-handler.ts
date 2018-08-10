import { configureKOAHandler } from './configure-koa-handler'
import { initialFeatures } from './initial-features'

export const createKOAHandler = configureKOAHandler({ initialFeatures })
