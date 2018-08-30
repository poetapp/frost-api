# Frost API

[![Build Status](https://travis-ci.com/poetapp/frost-api.svg?token=FP3fasWY3bH5YsQqyXXz&branch=master)](https://travis-ci.com/poetapp/frost-api)

Po.et API Layer for Publishers

## Guide
- [Getting started](#getting-started)
    - [Requirements](#requirements)
    - [Install](#install)
    - [How to Run Frost API (development mode)](#how-to-run-frost-api-development-mode)
- [API](#api)
  - [Accounts](#accounts)
    - [Create account](#create-account)
    - [Login account](#login-account)
    - [Verify account](#verify-account)
    - [Password reset](#password-reset)
    - [Password change](#password-change)
  - [Works](#works)
    - [Create work](#create-work)
    - [Get all works](#get-all-works)
    - [Get work](#get-work)
- [Contributing](#contributing)
    - [Coverage](#coverage)


## Getting started

#### Requirements

* NodeJS
* Docker
* Docker compose

#### Install

```bash
git clone git@github.com:poetapp/frost-api.git
cd frost-api
npm i
```


#### How to Run Frost API (development mode)

Behind-scenes: When you start with development mode. This command will run all dependencies are needed for Frost API.
Docker Compose will start MongoDB, Consul, Vault and Po.et Node. The Frost API will work with Nodemon and you have the
ability to debug in the 5858 port also. If you are a user of VScode, the settings are ready.


```
npm run start:dev
```

## API

For the examples with curl, you need to set $FROST_URL.

## Accounts

### Health check

* **URL** /health
* **Method** GET
* **Response success**
    * Code: 200

### Create account

* **URL** /accounts
* **Method** POST
* **Data Params**
    * email
        * Required
    * password
        * Required
        * Security complexity
            - minimum **10**
            - maximum **30**
            - lowercase **1**
            - uppercase **1**
            - numeric **1**
            - symbol **1**

* **Response success**
    * Code: 200
    * Content: `{ token: '123456789' }`

* **Response error**
    * Code: 409
    * Content 'The specified account already exists.'

    * Code: 422
    * Content 'One of the request inputs is not valid.'

    * Code: 500
    * Content 'The server encountered an internal error. Please retry the request.'

**Example with curl**

```bash

curl -H "Content-Type: application/json" -X POST -d '{"email":"...","password":"..."}' $FROST_URL/accounts

```

### Login account

* **URL** /login
* **Method** POST
* **Data Params**
    * email
        * Required
    * password
        * Required
         * Security complexity
            - minimum **10**
            - maximum **30**
            - lowercase **1**
            - uppercase **1**
            - numeric **1**
            - symbol **1**

* **Response success**
    * Code: 200
    * Content: `{ token: '123456789' }`

* **Response error**
    * code: 400,
    * Content: 'The specified resource does not exist.'

    * Code: 422
    * Content 'One of the request inputs is not valid.'

    * Code: 500
    * Content 'The server encountered an internal error. Please retry the request.'

**Example with curl**

```bash

curl -H "Content-Type: application/json" -X POST -d '{"email":"...","password":"..."}' $FROST_URL/login

```

### Verify account

When the user creates a new account the system automatically will send an email for the purpose of verifying the email address. This email contains a link, which the user only needs to click in order to verify the email address.

* **URL** /accounts/verify
* **Method** POST
* **Header Params**
    * token
        * Required

* **Response success**
    * Code: 200

* **Response error**
    * Code: 500
    * Content 'The server encountered an internal error. Please retry the request.'

**Example with curl**

```bash

curl -H "Content-Type: application/json" -X POST -d '{"email":"..."}' $FROST_URL/accounts/verify

```

Or the email verification token can be passed programatically to the server.

* **URL** /accounts/verify/:token
* **Method** GET
* **URL Params**
    * email
        * Required

* **Response success**
    * Code: 200

* **Response error**
    * Code: 500
    * Content 'The server encountered an internal error. Please retry the request.'

**Example with curl**

```bash

curl -H "Content-Type: application/json" -X GET $FROST_URL/accounts/verify/$FROST_TOKEN_VERIFY

```

### Password reset

* **URL** /password/reset
* **Method** POST
* **Data Params**
    * email
        * Required

* **Response success**
    * Code: 200

* **Response error**
    * Code: 500
    * Content 'The server encountered an internal error. Please retry the request.'

**Example with curl**

```bash

curl -H "Content-Type: application/json" -X POST -d '{"email":"..."}' $FROST_URL/password/reset

```

### Password change

Requires an authentication token (has already logged in with verified password).

* **URL** /password/change
* **Method** POST
* **Data Params**
    * password
        * Required

* **Header Params**
    * token
        * Required

* **Response success**
    * Code: 200

* **Response error**
    * Code: 422
    * Content 'One of the request inputs is not valid.'

    * Code: 409
    * Content: 'The specified account is not verified.'

    * Code: 500
    * Content 'The server encountered an internal error. Please retry the request.'

**Example with curl**

```bash

curl -H "Content-Type: application/json" -H "token: $FROST_TOKEN" -X POST -d '{"password":"..."}' $FROST_URL/password/change

```

## Works

### Create work

Requires an authentication token (has already logged in with verified password).

* **URL** /works
* **Method** POST
* **Data Params**
    * name
        * string - required
    * datePublished:
        * string - required - iso date
    * dateCreated
        * string - required - iso date
    * author
        * string - required
    * tags
        * string - optional
    * content
        * string - required

* **Header Params**
    * token
        * Required

* **Response success**
    * Code: 200

* **Response error**
    * Code: 400
    * Content 'Could not create the work.'

    * Code: 403
    * Content 'Server failed to authenticate the request.
      Make sure the value of the Authorization header is formed correctly
      including the signature.'

    * Code: 409
    * Content: 'The specified account is not verified.'

    * Code: 413
    * Content: 'Request entity is too large.'

    * Code: 422
    * Content 'One of the request inputs is not valid.'

    * Code: 500
    * Content 'The server encountered an internal error. Please retry the request.'

**Example with curl**

```bash

curl -H "Content-Type: application/json" -H "token: $FROST_TOKEN" -X POST -d '{"name":"...", "datePublished":"...", "dateCreated": "...","author": "...", "tags": "...", "content": "..."}' $FROST_URL/works

```

### Get all works

Requires an authentication token (has already logged in with verified password).

* **URL** /works
* **Method** GET
* **Header Params**
    * token
        * Required

* **Response success**
    * Code: 200

* **Response error**
    * Code: 403
    * Content 'Server failed to authenticate the request.
      Make sure the value of the Authorization header is formed correctly
      including the signature.'

    * Code: 409
    * Content: 'The specified account is not verified.'

    * Code: 500
    * Content 'The server encountered an internal error. Please retry the request.'

**Example with curl**

```bash

curl -H "Content-Type: application/json" -H "token: $FROST_TOKEN" -X GET $FROST_URL/works

```

### Get work

Requires an authentication token (has already logged in with verified password).

* **URL** /works/:workId
* **Method** GET
* **Header Params**
    * token
        * Required

* **Response success**
    * Code: 200

* **Response error**
    * Code: 403
    * Content 'Server failed to authenticate the request.
      Make sure the value of the Authorization header is formed correctly
      including the signature.'

    * Code: 500
    * Content 'The server encountered an internal error. Please retry the request.'

**Example with curl**

```bash

curl -H "Content-Type: application/json" -H "token: $FROST_TOKEN" -X GET $FROST_URL/works/:workId

```

## [Vault](https://www.vaultproject.io/)

### [Basics](https://www.vaultproject.io/intro/getting-started/dev-server.html)

Start

```bash

vault server -config=config.hcl

```

Stop

```bash

ps ax | grep vault
kill -INT vault_pid

```

Get transit keys

```bash

curl --header "X-Vault-Token: ..." --request LIST http://localhost:8200/v1/transit/keys

```

Create s specific key

```bash

curl --header "X-Vault-Token: ..." --request POST  http://localhost:8200/v1/transit/keys/my-key

```

Read a specific key

```bash

curl --header "X-Vault-Token: ..." http://localhost:8200/v1/transit/keys/my-key

```

Error checking seal status: Get https://127.0.0.1:8200/v1/sys/seal-status: http: server gave HTTP response to HTTPS client

```bash

export VAULT_ADDR='http://127.0.0.1:8200'

```

## [Consul](https://www.consul.io)

### [Basics](https://www.consul.io/docs/agent/basics.html)

Start

```bash

consul agent -server -bootstrap-expect 1 -data-dir /tmp/consul -bind 127.0.0.1

```

Stop

```bash

ps ax | grep consul
kill -INT consul_pid

```

Delete data

Warning, only use in developing mode

```bash

curl -X DELETE 'http://localhost:8500/v1/kv/vault?recurse'

```

## Contributing

### Coverage

Coverage is generated with [Istanbul](https://github.com/istanbuljs/nyc).
A more complete report can be generated by running `npm run coverage`, this command will run the `npm run coverage:unit` and `npm run coverage:integration` together. Also you will be able to execute these commands separately.

Coverage for unit test

`npm run coverage:unit`

Coverage for integration test

`npm run coverage:integration`

> Note: we're using our own forks of [nyc](https://github.com/istanbuljs/nyc) and [istanbul-lib-instrument](https://github.com/istanbuljs/istanbuljs/tree/master/packages/istanbul-lib-instrument) that add better support for TypeScript. We intend to contribute our forks back to nyc and istanbul-lib-instrument in order to make our solution available for all the community.
You can follow the issues in this [PR](https://github.com/poetapp/node/pull/230), and check the new PRs for [istanbul-lib-instrument](https://github.com/istanbuljs/istanbuljs/pull/204)
