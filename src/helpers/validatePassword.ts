import * as Joi from 'joi'
const PasswordComplexity = require('joi-password-complexity')

import { PasswordComplexConfiguration } from '../api/PasswordComplexConfiguration'

export const validatePassword = (password: string, passwordComplexity: PasswordComplexConfiguration) =>
  Joi.validate(password, new PasswordComplexity(passwordComplexity), (err: Joi.Err, value: string) => {
    if (err) throw getTextErrorPassword(passwordComplexity)
    return value
  })

const getTextErrorPassword = (options: PasswordComplexConfiguration) => `Password requirements: ${mapOptions(options)}.`

const mapOptions = (options: PasswordComplexConfiguration) => Object
  .entries(options)
  .map(([key, value]) => `${key}: ${value}`)
  .join(', ')
