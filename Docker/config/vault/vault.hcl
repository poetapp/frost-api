disable_cache = true
disable_mlock = true

storage "consul" {
  address = "consul:8500"
  path = "vault"
  scheme = "http"
  token = "398073a8-5091-4d9c-871a-bbbeb030d1f6"
}

listener "tcp" {
 address = "0.0.0.0:8200"
 tls_disable = 1
}
