.PHONY: setuppc
setuppc:
	@echo "Setting up pre-commit and hooks..."
	python3 -m pip install pre-commit
	pre-commit install

ifeq ($(shell uname),Darwin)
	@echo "Setting up shfmt (macOS)..."
	brew install shfmt

	@echo "Setting up shellcheck (macOS)..."
	brew install shellcheck
else
	@echo "Setting up shfmt (Linux)..."
	wget -qO shfmt "https://github.com/mvdan/sh/releases/download/v3.7.0/shfmt_v3.7.0_$(shell uname -m)"
	chmod +x shfmt
	sudo mv shfmt /usr/local/bin/shfmt

	@echo "Setting up shellcheck (Linux)..."
	sudo apt-get install shellcheck || sudo yum install shellcheck || sudo dnf install shellcheck
endif

.PHONY: reqtxt
reqtxt:
	poetry export -f requirements.txt --output requirements.txt --without-hashes

.PHONY: dev-v3
dev-v3:
	@echo "Synthesizing backend v3 CDK stack..."
	cd backendv3 && cdk synth

.PHONY: deploy-v3
deploy-v3:
	@echo "Deploying backend v3 CDK stack..."
	cd backendv3 && cdk deploy

.PHONY: build-v3
build-v3:
	@echo "Packaging backend v3 CDK stack..."
	cd backendv3 && cdk synth
