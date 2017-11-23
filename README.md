# api
Po.et API Layer for Publishers


## Vault

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
