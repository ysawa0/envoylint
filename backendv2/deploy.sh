#!/bin/bash

# EnvoyLint v2 - AWS CDK Deployment Script
# Zero storage costs - downloads binaries at runtime from GitHub releases

set -e

echo "🚀 Deploying EnvoyLint v2 Backend..."

# Check if AWS CDK is installed
if ! command -v cdk &>/dev/null; then
	echo "❌ AWS CDK not found. Installing..."
	npm install -g aws-cdk
fi

# Check if virtual environment exists
if [ ! -d "venv" ]; then
	echo "📦 Creating Python virtual environment..."
	python3 -m venv venv
fi

# Activate virtual environment
echo "🔄 Activating virtual environment..."
source venv/bin/activate

# Install Python dependencies
echo "📥 Installing Python dependencies..."
pip install -r requirements.txt

# Bootstrap CDK (only needed once per account/region)
echo "🏗️  Bootstrapping CDK (if needed)..."
cdk bootstrap || echo "CDK already bootstrapped"

# Synthesize the CloudFormation template
echo "🔧 Synthesizing CloudFormation template..."
cdk synth

# Deploy the stack
echo "🚀 Deploying stack..."
cdk deploy --require-approval never

# Get the API URL
echo "📋 Getting API URL..."
API_URL=$(aws cloudformation describe-stacks --stack-name EnvoylintV2Stack --query 'Stacks[0].Outputs[?OutputKey==`ApiUrl`].OutputValue' --output text)

echo ""
echo "✅ Deployment completed successfully!"
echo "🌐 API URL: $API_URL"
echo ""
echo "📖 Usage:"
echo "  curl -X POST $API_URL/validate/1.34.1 \\"
echo "       -H 'Content-Type: application/json' \\"
echo "       -d '{\"conf\": \"your-envoy-config-here\"}'"
echo ""
echo "🎯 Supported versions:"
cat versions.json | python3 -c "import sys, json; print('  - ' + '\\n  - '.join(json.load(sys.stdin)['versions'].keys()))"
echo ""
echo "💰 Cost: FREE storage (runtime download from GitHub) + Lambda execution only"
echo "🔄 To add new versions: Update versions.json and redeploy"
