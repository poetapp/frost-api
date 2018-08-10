export interface Feature {
  readonly name: string
  readonly isActive: boolean
  readonly dependencies?: ReadonlyArray<string>
}

export type InitialFeatures = ReadonlyArray<Feature>
