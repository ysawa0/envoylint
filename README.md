# envoylint

[![Netlify Status](https://api.netlify.com/api/v1/badges/5fb8f73f-4b59-4ac1-8916-7b63e7182aec/deploy-status)](https://app.netlify.com/sites/dazzling-mahavira-26b329/deploys)

# Frontend

The frontend is a static React site deployed via Netlify. Netlify is synced to this repo.

The site calls the Lamba backend to do the config validation.

```
cd frontend
yarn install
yarn start
```

# Backend

Deploy via Serverless Framework to AWS Lambda.
Each Lambda calls an Envoy binary

```
cd backend
npm install -g serverless
sls plugin install -n serverless-python-requirements
sls deploy --stage dev
```

## How to build config_load_check_tool for Lambda

Spin up a EC2 instance using Amazon Linux (t3a.xlarge or larger recommended for manageable build time and enough memory)

Then run

```
sudo yum update -y; sudo yum install git tmux -y; git clone https://github.com/envoyproxy/envoy.git
sudo amazon-linux-extras install docker -y; sudo service docker start; sudo usermod -a -G docker ec2-user
sudo yum groupinstall "Development Tools" -y

# Log out then log back in to apply usermod

cd envoy; tmux new; ./ci/run_envoy_docker.sh 'tail -f /dev/null'

# Docker exec into CI container then run
git clone https://github.com/envoyproxy/envoy.git; cd envoy
bazel build //test/tools/config_load_check:config_load_check_tool
```

## How to get Envoy binary for Lambda Layer

```
docker run envoyproxy/envoy:v1.15.2
docker cp $(docker ps -q):/usr/local/bin/envoy .
```
