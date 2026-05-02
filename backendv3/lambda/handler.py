import json
import os
import subprocess
import uuid


def response(body, status=200):
    return {
        "statusCode": status,
        "headers": {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Credentials": True,
            "Content-Type": "application/json",
        },
        "body": json.dumps(body),
        "isBase64Encoded": False,
    }


def handler(event, context):
    request_id = str(uuid.uuid4())
    work_dir = f"/tmp/{request_id}"
    conf_path = f"{work_dir}/conf.yaml"

    os.makedirs(work_dir, exist_ok=True)

    body = json.loads(event.get("body") or "{}")
    with open(conf_path, "w") as f:
        f.write(body.get("conf", ""))

    command = [
        "/opt/envoy",
        "--mode",
        "validate",
        "-c",
        conf_path,
        "--service-node",
        "mock",
        "--service-cluster",
        "mockcluster",
    ]

    result = subprocess.run(command, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    os.remove(conf_path)
    os.rmdir(work_dir)

    return response(
        {
            "out": result.stdout.decode(),
            "err": result.stderr.decode(),
            "code": result.returncode,
        }
    )
