declare module 'uuid/lib/bytesToUuid' {
  export = bytesToUuid
  function bytesToUuid(buf: Buffer, offset?: number): string
}
