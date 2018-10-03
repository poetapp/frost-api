export const errorMessages = {
  inputsNotValid: `One of the inputs is not valid. Password Requirements, 
  min: 10 max: 30 lowerCase: 1 upperCase: 1 numeric: 1 symbol: 1 requirementCount: 4`,
  emailVerified: 'Email already verified.',
  invalidToken: 'Invalid token.',
  accountExists: 'The specified account already exists.',
  resourceNotExist: 'The specified resource does not exist.',
  accountIsNotVerified: 'The specified account is not verified.',
  maximumTokens: 'You have reached the maximum number of allowed tokens.',
  actionNotAllowed: 'The token does not have sufficient permissions for this action.',
  badDate: `One of the inputs is not valid. 
  ValidationError: child "datePublished" 
  fails because ["datePublished"must be a valid ISO 8601 date]`,
  workNotFound: 'Work not found.',
  payloadTooLarge: 'request entity too large',
}
