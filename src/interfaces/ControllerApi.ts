export interface ControllerApi {
  handler(ctx: any, next: any): Promise<any>
  validate(values: object): object
  validateOptions?(): object
}
