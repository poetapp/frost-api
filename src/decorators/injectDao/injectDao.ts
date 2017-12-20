export const injectDao = (Dao: any) => {
  return (target: any) => {
    target.prototype.dao = new Dao()
  }
}
