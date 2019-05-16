import { bufferToHex, ecrecover, fromRpcSig, hashPersonalMessage, publicToAddress } from 'ethereumjs-util'

export function signatureIsValid(address: string, message: string, signature: string): boolean {
  if (!address || !signature)
    return false

  try {
    const msgHash = hashPersonalMessage(Buffer.from(message))

    const signatureParams = fromRpcSig(signature)
    const publicKey = ecrecover(
      msgHash,
      signatureParams.v,
      signatureParams.r,
      signatureParams.s,
    )
    const addressBuffer = publicToAddress(publicKey)
    const addressVerified = bufferToHex(addressBuffer)

    return addressVerified === address
  } catch (exception) {
    if (exception.message === 'Invalid signature length')
      return false
    else if (exception.message === 'couldn\'t recover public key from signature')
      return false
    else
      throw exception
  }
}
