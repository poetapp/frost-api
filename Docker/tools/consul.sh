#!/bin/sh

apk add --no-cache curl

consul agent -config-dir /usr/share/consul --dev -server -ui -bootstrap-expect 1 -client 0.0.0.0


consul_ready() {
    curl http://0.0.0.0:8500/v1/status/leader
}


while !(consul_ready)
do
    echo "waiting for consul ..."
    sleep 30
done


curl --request PUT --data '{ "Name": "Master Token", "Type": "management", "Rules": "key \"\" { policy = \"read\" } key \"foo/\" { policy = \"write\" } key \"foo/private/\" { policy = \"deny\" } operator = \"read\"" }' http://0.0.0.0:8500/v1/acl/create?token=398073a8-5091-4d9c-871a-bbbeb030d1f6
