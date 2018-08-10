import { isActiveFeatureName, getCurrentActiveFeatureNames } from '@paralleldrive/feature-toggles'
import { Context } from 'koa'

import { InitialFeatures } from './interfaces'

type handler = (ctx?: Context, next?: () => Promise<void>) => Promise<void>

interface Configuration {
  initialFeatures: InitialFeatures
}

const isActive = (initialFeatures: InitialFeatures, featureName: string, ctx: any) =>
  isActiveFeatureName(featureName, getCurrentActiveFeatureNames({ initialFeatures, req: ctx }))

export const configureKOAHandler = ({ initialFeatures }: Configuration) => (inactiveHandler: handler) => (
  featureName: string
) => (activeHandler: handler): handler => async (ctx, next) =>
  isActive(initialFeatures, featureName, ctx) ? await activeHandler(ctx, next) : await inactiveHandler(ctx, next)
