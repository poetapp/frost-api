// tslint:disable:max-classes-per-file

export const errors = {
  AccountAlreadyExists: {
    code: 409,
    message: 'The specified account already exists.',
  },
  AuthenticationFailed: {
    code: 403,
    message: `Server failed to authenticate the request.
      Make sure the value of the Authorization header is formed correctly
      including the signature.`,
  },
  AccountNotFound: {
    code: 404,
    message: 'Account not found.',
  },
  AccountNotVerify: {
    code: 409,
    message: 'The specified account is not verified.',
  },
  InvalidInput: {
    code: 422,
    message: 'One of the inputs is not valid.',
  },
  ResourceNotFound: {
    code: 400,
    message: 'The specified resource does not exist.',
  },
  InternalError: {
    code: 500,
    message: 'The server encountered an internal error. Please retry the request.',
  },
  EmailVerfied: {
    code: 400,
    message: 'Email already verified.',
  },
  WorkError: {
    code: 400,
    message: 'Could not create the work.',
  },
  WorkNotFound: {
    code: 400,
    message: 'Work not found.',
  },
  InternalErrorExternalAPI: {
    code: 500,
    message:
      'The server encountered an internal error. Error parsing data from external API. Please retry the request.',
  },
  InvalidToken: {
    code: 422,
    message: 'Invalid token.',
  },
  ExpiredToken: {
    code: 422,
    message: 'Expired token.',
  },
  MaximumApiTokensLimitReached: {
    code: 409,
    message: 'You have reached the maximum number of allowed tokens.',
  },
  BadTokenScope: {
    code: 409,
    message: 'The token does not have sufficient permissions for this action.',
  },
  RateLimitReached: {
    code: 429,
    message: 'Too many attempts. Please try again later.',
  },
}

export class Unauthorized extends Error {
  status = 403
  message = 'Not authorized.'
}

export class AccountNotFound extends Error {
  status = errors.AccountNotFound.code
  message = errors.AccountNotFound.message
}

export class AccountAlreadyExists extends Error {
  status = errors.AccountAlreadyExists.code
  message = errors.AccountAlreadyExists.message
}

export class IncorrectOldPassword extends Error {
  status = 403
  message = 'Incorrect Old Password.'
}

export class IncorrectToken extends Error {
  status = 401

  constructor(got: string, wanted: string) {
    super(`Incorrect Token Type. Got "${got}", wanted "${wanted}".`)
  }
}
