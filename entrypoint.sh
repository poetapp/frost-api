#!/bin/bash
set -e

API_HOME="/usr/src/app/api"

cd ${API_HOME}

if [ "$1" = 'api' ]; then
    exec npm start
fi

exec "$@"
