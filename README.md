# Frost API

Po.et API Layer for Publishers


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
