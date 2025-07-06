# EnvoyLint v2 Backend

A modern, cost-effective serverless backend for validating Envoy configurations using AWS CDK.

## 🚀 Features

- **Zero Storage Costs**: Downloads Envoy binaries at runtime from GitHub releases
- **Single Lambda Function**: Handles all Envoy versions through one endpoint
- **Easy Version Management**: Add new versions by updating `versions.json`
- **AWS CDK**: Modern infrastructure as code
- **CORS Enabled**: Ready for frontend integration
- **Auto-scaling**: Serverless architecture scales with demand

## 📁 Architecture

```
backend-v2/
├── app.py                    # CDK app entry point
├── envoylint_v2_stack.py    # CDK stack definition
├── lambda/
│   └── handler.py           # Lambda function code
├── versions.json            # Supported Envoy versions
├── deploy.sh               # Deployment script
├── requirements.txt        # Python dependencies
├── cdk.json               # CDK configuration
└── README.md              # This file
```

## 🔧 Deployment

### Prerequisites

- AWS CLI configured with appropriate credentials
- Node.js (for AWS CDK)
- Python 3.11+

### Deploy

```bash
# Make deploy script executable (if not already)
chmod +x deploy.sh

# Deploy everything
./deploy.sh
```

## 🌐 API Usage

### Endpoint

```
POST {API_URL}/validate/{version}
```

### Request Format

```json
{
  "conf": "your-envoy-configuration-yaml-here"
}
```

### Example

```bash
curl -X POST https://your-api-id.execute-api.us-east-1.amazonaws.com/prod/validate/1.34.1 \
     -H 'Content-Type: application/json' \
     -d '{
       "conf": "static_resources:\n  listeners:\n  - name: listener_0\n    address:\n      socket_address:\n        address: 0.0.0.0\n        port_value: 10000"
     }'
```

### Response Format

```json
{
  "out": "configuration validation output",
  "err": "error messages if any",
  "code": 0,
  "version": "1.34.1"
}
```

## 📝 Supported Versions

Current versions (update `versions.json` to add more):

- 1.29.0
- 1.30.0
- 1.31.0
- 1.32.0
- 1.33.0
- 1.34.0
- 1.34.1

## 💰 Cost Structure

- **Storage**: $0 (runtime download from GitHub)
- **Lambda**: ~$0.02 per 1M requests
- **API Gateway**: ~$3.50 per 1M requests
- **CloudWatch Logs**: ~$0.50 per GB

## 🔄 Adding New Versions

1. Update `versions.json` with new version:

```json
{
  "versions": {
    "1.35.0": {
      "url": "https://github.com/envoyproxy/envoy/releases/download/v1.35.0/envoy-contrib-1.35.0-linux-x86_64",
      "release_date": "2025-06-15",
      "status": "active"
    }
  }
}
```

2. Update the CDK stack environment in `envoylint_v2_stack.py`

3. Redeploy:

```bash
./deploy.sh
```

## 🧪 Local Testing

```bash
# Activate virtual environment
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Test the handler locally
cd lambda
python3 handler.py
```

## 🔍 Monitoring

- CloudWatch Logs: `/aws/lambda/EnvoylintV2Stack-EnvoyValidator*`
- CloudWatch Metrics: Lambda function metrics
- API Gateway: Request/response metrics

## 🛠️ Development

### CDK Commands

```bash
# Install dependencies
pip install -r requirements.txt

# Synthesize CloudFormation template
cdk synth

# Deploy stack
cdk deploy

# Destroy stack
cdk destroy
```

### Testing

```bash
# Run tests
pytest

# Format code
black .

# Type checking
mypy .
```

## 🔒 Security

- CORS configured for web frontend integration
- No sensitive data stored
- IAM roles follow principle of least privilege
- CloudWatch logs for audit trail

## 📊 Comparison with v1

| Feature    | v1 (Serverless Framework)     | v2 (AWS CDK)            |
| ---------- | ----------------------------- | ----------------------- |
| Functions  | 12 separate functions         | 1 function              |
| Storage    | AWS Lambda Layers (~$X/month) | Runtime download (Free) |
| Deployment | Complex serverless.yml        | Simple CDK              |
| Versions   | Hard-coded in config          | JSON configuration      |
| Framework  | Serverless v2 (EOL)           | AWS CDK (Modern)        |
| Cost       | High (storage + execution)    | Low (execution only)    |
