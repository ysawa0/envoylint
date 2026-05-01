# EnvoyLint V3 - Cloudflare Containers

A modernized version of the Envoy configuration validator that runs on Cloudflare Containers for global edge deployment.

## Architecture

- **Worker**: JavaScript Worker that handles routing and CORS
- **Container**: Python Flask application that performs Envoy validation
- **Edge Deployment**: Global distribution via Cloudflare's edge network
- **Scale-to-Zero**: Only pay for active runtime

## Key Improvements over V2

- **Global Edge Deployment**: Runs on Cloudflare's global network instead of single AWS region
- **Scale-to-Zero Pricing**: No charges when idle, pay only for active requests
- **Simplified Infrastructure**: No CDK, Lambda layers, or API Gateway complexity
- **Container Support**: Full Python runtime without Lambda limitations
- **Faster Cold Starts**: Cloudflare Containers boot faster than Lambda

## Deployment

### Prerequisites

1. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

2. Install Docker and ensure it's running

3. Install Wrangler CLI:
   ```bash
   curl -fsSL https://developers.cloudflare.com/workers/wrangler/install/ | sh
   ```

4. Authenticate with Cloudflare:
   ```bash
   wrangler login
   ```

### Local Development

```bash
make dev-v3
```

This will:
- Build the container image
- Start local development server
- Enable hot-reload for both Worker and Container

### Production Deployment

```bash
make deploy-v3
```

This will:
- Build and push the container image to Cloudflare's registry
- Deploy the Worker to the edge
- Make the API globally available

### Build Container Only

```bash
make build-v3
```

## API Usage

The API maintains compatibility with V2:

```bash
# Validate Envoy configuration
curl -X POST https://your-worker.your-subdomain.workers.dev/validate/1.34.1 \
  -H "Content-Type: application/json" \
  -d '{"conf": "your-envoy-config-yaml"}'
```

## Environment Variables

Configure supported Envoy versions in `wrangler.toml`:

```toml
[vars]
VERSIONS_CONFIG = '''
{
  "1.34.1": {
    "url": "https://github.com/envoyproxy/envoy/releases/download/v1.34.1/envoy-contrib-1.34.1-linux-x86_64"
  }
}
'''
```

## Container Configuration

The container runs a Flask application that:
- Downloads Envoy binaries at runtime from GitHub releases
- Validates configurations using the official Envoy binary
- Returns validation results with stdout, stderr, and exit codes

## Cost Optimization

- **No idle costs**: Containers scale to zero when not in use
- **Free CDN**: Downloads Envoy binaries from GitHub's free CDN
- **Global edge**: Reduced latency and data transfer costs
- **No storage**: No persistent storage costs for binaries

## Monitoring

Use Cloudflare Analytics to monitor:
- Request volume and latency
- Error rates
- Geographic distribution
- Container performance metrics