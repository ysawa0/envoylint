import json
import os
import subprocess
import urllib.request
import uuid
from pathlib import Path
from typing import Any, Dict, Optional
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)


@app.route('/validate/<version>', methods=['POST'])
def validate(version: str):
    print(f"Received validation request for version: {version}")
    print(f"Request method: {request.method}")
    print(f"Request headers: {dict(request.headers)}")
    """
    Cloudflare container handler for Envoy configuration validation.
    Downloads Envoy binary at runtime from GitHub releases.
    """
    try:
        # Parse request body
        try:
            body = request.get_json()
            if not body:
                return jsonify({"error": "Request body is required"}), 400
            
            config = body.get("conf", "")
            if not config:
                return jsonify({"error": "Configuration content is required"}), 400
        except Exception:
            return jsonify({"error": "Invalid JSON in request body"}), 400

        # Get supported versions from environment
        versions_config_str = os.getenv("VERSIONS_CONFIG", "{}")
        print(f"VERSIONS_CONFIG env var: {versions_config_str}")
        versions_config = json.loads(versions_config_str)

        if version not in versions_config:
            return jsonify({
                "error": f"Version {version} not supported",
                "supported_versions": list(versions_config.keys())
            }), 404

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
            cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, timeout=25
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

        return jsonify(response), 200

    except subprocess.TimeoutExpired as e:
        return jsonify({
            "error": "Validation timed out",
            "exception_type": "TimeoutExpired",
            "exception_details": str(e),
            "timeout_seconds": 25
        }), 500
    except Exception as e:
        import traceback
        return jsonify({
            "error": str(e),
            "exception_type": type(e).__name__,
            "traceback": traceback.format_exc()
        }), 500


@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint."""
    return jsonify({"status": "healthy"}), 200


def download_envoy_binary(version: str, download_url: str) -> str:
    """
    Download Envoy binary from GitHub releases to container's /tmp directory.
    Uses free GitHub CDN - no storage costs!
    """
    binary_path = f"/tmp/envoy-{version}"

    # Check if binary already exists (container reuse)
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
        raise e


if __name__ == "__main__":
    # For local testing
    port = int(os.environ.get("PORT", 8080))
    app.run(host="0.0.0.0", port=port, debug=True)