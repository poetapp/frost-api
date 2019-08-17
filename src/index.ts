#!/usr/bin/env node

/* tslint:disable:no-console */
import { Frost } from './Frost'

import './extensions/Error'

require('dotenv').config({ path: '.env' })

Frost()
  .then(server => process.on('SIGINT', () => server.stop()))
  .catch(console.error)
