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
  AccountNotVerify: {
    code: 409,
    message: 'The specified account is not verified'
  },
  InvalidInput: {
    code: 422,
    message: 'One of the request inputs is not valid.'
  },
  ResourceNotFound: {
    code: 400,
    message: 'The specified resource does not exist.'
  },
  InternalError: {
    code: 500,
    message:
      'The server encountered an internal error. Please retry the request.'
  },
  EmailVerfied: {
    code: 400,
    message: 'Email already verified.'
  },
  WorkError: {
    code: 400,
    message: 'Could not create the work'
  },
  WorkNotFound: {
    code: 400,
    message: 'Work not found.'
  },
  InternalErrorExternalAPI: {
    code: 500,
    message:
      'The server encountered an internal error. Error parsing data external API. Please retry the request.'
  }
}
