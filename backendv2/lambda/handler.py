import json
import os
import subprocess
import urllib.request
import uuid
from pathlib import Path
from typing import Any, Dict


def validate(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Lambda handler for Envoy configuration validation.
    Downloads Envoy binary at runtime from GitHub releases (free CDN).
    """
    try:
        # Parse version from path parameters
        version = event.get("pathParameters", {}).get("version")
        if not version:
            return {
                "statusCode": 400,
                "headers": {"Access-Control-Allow-Origin": "*", "Content-Type": "application/json"},
                "body": json.dumps({"error": "Version parameter is required"}),
            }

        # Parse request body
        try:
            body = json.loads(event.get("body", "{}"))
            config = body.get("conf", "")
            if not config:
                return {
                    "statusCode": 400,
                    "headers": {"Access-Control-Allow-Origin": "*", "Content-Type": "application/json"},
                    "body": json.dumps({"error": "Configuration content is required"}),
                }
        except json.JSONDecodeError:
            return {
                "statusCode": 400,
                "headers": {"Access-Control-Allow-Origin": "*", "Content-Type": "application/json"},
                "body": json.dumps({"error": "Invalid JSON in request body"}),
            }

        # Get supported versions from environment
        versions_config = json.loads(os.getenv("VERSIONS_CONFIG", "{}"))

        if version not in versions_config:
            return {
                "statusCode": 404,
                "headers": {"Access-Control-Allow-Origin": "*", "Content-Type": "application/json"},
                "body": json.dumps(
                    {"error": f"Version {version} not supported", "supported_versions": list(versions_config.keys())}
                ),
            }

        # Download and prepare Envoy binary
        binary_path = download_envoy_binary(version, versions_config[version]["url"])

        # Create unique temporary directory for this request
        request_id = str(uuid.uuid4())
        temp_dir = Path(f"/tmp/{request_id}")
        temp_dir.mkdir(exist_ok=True)

        config_file = temp_dir / "conf.yaml"

        # Write configuration to file
        with open(config_file, "w") as f:
            f.write(config)

        # Run Envoy validation
        cmd = [
            binary_path,
            "--mode",
            "validate",
            "-c",
            str(config_file),
            "--service-node",
            "mock",
            "--service-cluster",
            "mockcluster",
        ]

        result = subprocess.run(
            cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, timeout=25  # Leave 5 seconds for cleanup
        )

        # Clean up temp files
        config_file.unlink(missing_ok=True)
        temp_dir.rmdir()

        # Return validation results
        response = {
            "out": result.stdout.decode("utf-8"),
            "err": result.stderr.decode("utf-8"),
            "code": result.returncode,
            "version": version,
        }

        return {
            "statusCode": 200,
            "headers": {"Access-Control-Allow-Origin": "*", "Content-Type": "application/json"},
            "body": json.dumps(response),
        }

    except subprocess.TimeoutExpired:
        return {
            "statusCode": 500,
            "headers": {"Access-Control-Allow-Origin": "*", "Content-Type": "application/json"},
            "body": json.dumps({"error": "Validation timed out"}),
        }
    except Exception as e:
        print(f"Error: {str(e)}")
        return {
            "statusCode": 500,
            "headers": {"Access-Control-Allow-Origin": "*", "Content-Type": "application/json"},
            "body": json.dumps({"error": f"Internal server error: {str(e)}"}),
        }


def download_envoy_binary(version: str, download_url: str) -> str:
    """
    Download Envoy binary from GitHub releases to Lambda's /tmp directory.
    Uses free GitHub CDN - no AWS storage costs!
    """
    binary_path = f"/tmp/envoy-{version}"

    # Check if binary already exists (Lambda container reuse)
    if Path(binary_path).exists():
        return binary_path

    print(f"Downloading Envoy {version} from {download_url}")

    try:
        # Download binary using urllib (no external dependencies)
        urllib.request.urlretrieve(download_url, binary_path)

        # Make executable
        os.chmod(binary_path, 0o755)

        print(f"Successfully downloaded Envoy {version} to {binary_path}")
        return binary_path

    except Exception as e:
        print(f"Failed to download Envoy {version}: {str(e)}")
        raise Exception(f"Failed to download Envoy binary: {str(e)}")


# For local testing
if __name__ == "__main__":
    # Test event
    test_event = {
        "pathParameters": {"version": "1.34.1"},
        "body": json.dumps(
            {
                "conf": """
static_resources:
  listeners:
  - name: listener_0
    address:
      socket_address:
        address: 0.0.0.0
        port_value: 10000
"""
            }
        ),
    }

    # Set environment for testing
    os.environ["VERSIONS_CONFIG"] = json.dumps(
        {
            "1.34.1": {
                "url": "https://github.com/envoyproxy/envoy/releases/download/v1.34.1/envoy-contrib-1.34.1-linux-x86_64"
            }
        }
    )

    result = validate(test_event, None)
    print(json.dumps(result, indent=2))
