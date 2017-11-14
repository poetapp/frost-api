export interface ControllerApi {
  handler(ctx: any, next: any): Promise<any>
  validate(): object
}
