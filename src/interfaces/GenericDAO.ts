export interface GenericDAO<T> {
  create(model: T): Promise<T>
  get(id: number | string): Promise<T | any>
  update(id: string, model: any): Promise<T>
  delete(id: number | string): Promise<any>
}
