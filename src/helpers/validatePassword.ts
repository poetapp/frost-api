import * as Joi from 'joi'
const PasswordComplexity = require('joi-password-complexity')

import { PasswordComplexConfiguration } from '../api/PasswordComplexConfiguration'
import { ComplexityOptions } from '../interfaces/ComplexityOptions'

export const validatePassword = (password: string, passwordComplexity: PasswordComplexConfiguration) =>
  Joi.validate(password, new PasswordComplexity(passwordComplexity), (err: Joi.Err, value: string) => {
    if (err) throw getTextErrorPassword(passwordComplexity)
    return value
  })

const getTextErrorPassword = (options: ComplexityOptions) => `Password requirements: ${mapOptions(options)}.`

const mapOptions = (options: ComplexityOptions) => Object
  .entries(options)
  .map(([key, value]) => `${key}: ${value}`)
  .join(', ')
