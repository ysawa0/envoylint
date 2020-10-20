# envoylint

## How to build config_load_check_tool
Spin up a EC2 instance (t3a.xlarge or larger recommended for manageable build time and enough memory)
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
