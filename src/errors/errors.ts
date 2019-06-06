// tslint:disable:max-classes-per-file

import { byteLengthToHumanReadable } from '../helpers/byteSizes'

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

export class ResourceNotFound {
  status = 404
  message = 'The specified resource does not exist.'
}

export class IncorrectOldPassword extends Error {
  status = 403
  message = 'Incorrect Old Password.'
}

export class IncorrectToken extends Error {
  status = 401

  constructor(got: string, wanted: string | string[]) {
    super(
      `Incorrect Token Type. Got "${got}", ` +
      `wanted ${Array.isArray(wanted) ? `one of [${wanted.map(_ => `"${_}"`).join(', ')}]` : `"${wanted}"`}.`,
    )
  }
}

export class EmailAlreadyVerified extends Error {
  status = 422
  message = 'Email already verified.'
}

export class BadToken extends Error {
  status = errors.ExpiredToken.code
  message = errors.ExpiredToken.message
}

export class InvalidToken extends Error {
  status = errors.InvalidToken.code
  message = errors.InvalidToken.message
}

export class AuthenticationFailed extends Error {
  status = errors.AuthenticationFailed.code
  message = errors.AuthenticationFailed.message
}

export class PoeAddressNotVerified extends Error {
  status = 403
  message = 'POE address not verified.'
}

export class PoeBalanceInsufficient extends Error {
  status = 403

  constructor(minimum: number, balance: number) {
    super(`Insufficient POE balance. You need at least ${minimum} POE. You currently have ${balance}.`)
  }
}

export class FileTooBig extends Error {
  status = 403

  constructor(size: number, maxSize: number) {
    super(
      `File too big. Got ${byteLengthToHumanReadable(size)}. ` +
      `Max is ${byteLengthToHumanReadable(maxSize)}.`,
    )
  }
}
