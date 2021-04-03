# Kill any other docker containers already running before executing this
# Places envoy binary into backend/bin/envoy-$1/envoy
docker run -d envoyproxy/envoy:v$1
mkdir -p backend/bin/envoy-$1
docker cp $(docker ps -q):/usr/local/bin/envoy backend/bin/envoy-$1/
docker kill $(docker ps -q)
