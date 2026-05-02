# EnvoyLint backend v3

CDK backend for the original EnvoyLint Lambda API.

This replaces the Serverless Framework stack with plain AWS CDK. It packages the existing Envoy binaries from `../backend/bin` as Lambda layers and does not build or upload container images to ECR.

## Deploy

```sh
uv run cdk deploy
```

The API keeps the original endpoint format:

```txt
POST /envoyv1280
POST /envoyv1231
```
