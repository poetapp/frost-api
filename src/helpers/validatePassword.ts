import * as Joi from 'joi'
const PasswordComplexity = require('joi-password-complexity')

import { PasswordComplexityConfiguration } from '../api/PasswordComplexityConfiguration'

export const validatePassword = (password: string, passwordComplexity: PasswordComplexityConfiguration) =>
  Joi.validate(password, new PasswordComplexity(passwordComplexity), (err: Joi.Err, value: string) => {
    if (err) throw getTextErrorPassword(passwordComplexity)
    return value
  })

const getTextErrorPassword = (options: PasswordComplexityConfiguration) =>
  `Password requirements: ${mapOptions(options)}.`

const mapOptions = (options: PasswordComplexityConfiguration) => Object
  .entries(options)
  .map(([key, value]) => `${key}: ${value}`)
  .join(', ')
