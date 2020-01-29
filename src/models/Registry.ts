export interface Registry {
  readonly id: string
  readonly ownerId: string
  readonly address: string
  readonly cidCount?: number
  readonly cids?: ReadonlyArray<string>
}
