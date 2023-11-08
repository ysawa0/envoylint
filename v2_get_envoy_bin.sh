#!/bin/bash
# Kill any other docker containers already running before executing this
# Ex: sh get_envoy_bin_v2.sh v1.26.1
# Places envoy binary into backendv2/bin/envoy-v1.26.1/envoy-v1.26.1

docker run -t -d --platform=linux/amd64 envoyproxy/envoy-contrib:$1
mkdir -p backendv2/bin/envoy-$1
docker cp $(docker ps -q):/usr/local/bin/envoy backendv2/bin/envoy-$1/envoy-$1
docker kill $(docker ps -q)
