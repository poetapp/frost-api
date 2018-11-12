#!/bin/bash
set -e

mongo <<EOF
use $FROST_DB
db.createUser({
  user:  '$FROST_DB_USER',
  pwd: '$FROST_DB_PASSWORD',
  roles: [{
    role: 'readWrite',
    db: '$FROST_DB'
  }]
})
EOF
