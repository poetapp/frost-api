export const errors = {
  AccountAlreadyExists: {
    code: 409,
    message: 'The specified account already exists.'
  },
  AuthenticationFailed: {
    code: 403,
    message: `Server failed to authenticate the request. 
      Make sure the value of the Authorization header is formed correctly 
      including the signature.`
  },
  InvalidInput: {
    code: 400,
    message: 'One of the request inputs is not valid.'
  },
  ResourceNotFound: {
    code: 400,
    message: 'The specified resource does not exist.'
  }
}
