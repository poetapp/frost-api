export const KiB = 1024
export const MiB = KiB ** 2
export const GiB = KiB ** 3

const symbolToSize: ReadonlyArray<[string, number]> = [
  ['B', 1],
  ['KiB', KiB],
  ['MiB', MiB],
  ['GiB', GiB],
]

export const byteLengthToHumanReadable =  (byteLength: number, fractionDigits: number = 2) => {
  for (let i = symbolToSize.length - 1; i >= 0; i--)
    if (byteLength >= symbolToSize[i][1])
      return (byteLength / symbolToSize[i][1]).toFixed(fractionDigits)  + ' ' + symbolToSize[i][0]
  throw new Error('Whoops!')
}
