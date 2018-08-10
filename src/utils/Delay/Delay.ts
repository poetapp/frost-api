export const delay = async (millis: number) =>
  new Promise((resolve, reject) => {
    setTimeout(resolve, millis)
  })
