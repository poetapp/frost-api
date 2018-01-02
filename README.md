# Frost API

Po.et API Layer for Publishers


---
## Guide

- [API](#API)
  - [Accounts](#accounts)
    - [Create account](#create-account)
    - [Login account](#login-account)
    - [Verify account](#verify-account)
    - [Password reset](#password-reset)
    - [Password change](#pasword-change)
  - [Works](#works)
    - [Create work](#create-work)
    - [Get all works](#get-all-works)
    - [Get work](get-work)

---

## API

Examaple with curl, you must to set $FROST_URL.
## Accounts
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
            - maximun **30**
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
            - maximun **30**
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

When the user creates a new account the system automatically will send an email for the purpose to verify this email account. This e-mail contains a link, the user only need to click in there. 

* **URL** /accounts/verify
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

curl -H "Content-Type: application/json" -X POST -d '{"email":"..."}' $FROST_URL/accounts/verify

```

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

Require, log in and password verified.

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

    * Code: 500
    * Content 'The server encountered an internal error. Please retry the request.'


**Example with curl**

```bash

curl -H "Content-Type: application/json" -H "token: $FROST_TOKEN" -X POST -d '{"password":"..."}' $FROST_URL/password/change

```

## Works
### Create work

Require, log in and password verified.

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
        * string - required
    * content 
        * string - required
        
* **Header Params**
    * token
        * Required

* **Response success**
    * Code: 200

* **Response error**
    * Code: 400
    * Content 'Could not create the work'

    * Code: 403
    * Content 'Server failed to authenticate the request. 
      Make sure the value of the Authorization header is formed correctly 
      including the signature.'

    * Code: 422
    * Content 'One of the request inputs is not valid.'

    * Code: 500
    * Content 'The server encountered an internal error. Please retry the request.'


**Example with curl**

```bash

curl -H "Content-Type: application/json" -H "token: $FROST_TOKEN" -X POST -d '{"name":"...", "datePublished":"...", "dateCreated": "...","author": "...", "tags": "...", "content": "..."}' $FROST_URL/works

```

### Get all works

Require, log in and password verified.

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

    * Code: 500
    * Content 'The server encountered an internal error. Please retry the request.'


**Example with curl**

```bash

curl -H "Content-Type: application/json" -H "token: $FROST_TOKEN" -X GET $FROST_URL/works

```


### Get work

Require, log in and password verified.

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
