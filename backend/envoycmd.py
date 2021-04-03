import json
import subprocess
import os
import uuid


from apig import init_api_event, as_apigateway_event, as_api_gateway_response


def lambda_handler(event, context):
    event = init_api_event(event)
    is_local = context is None

    u = str(uuid.uuid4())
    if is_local:
        cmd = "envoy"
        write_to = f"conf/{u}.yaml"
        read_from = "./tmp/mock.yaml"
    else:
        cmd = "/opt/envoy"
        write_to = f"/tmp/{u}/conf.yaml"
        read_from = f"/tmp/{u}"
        os.makedirs(read_from, exist_ok=True)

    conf = event.payload.get("conf", "")
    with open(write_to, "w") as f:
        f.write(conf)

    cmds = [cmd, "--mode", "validate", "-c", read_from + "/conf.yaml"]
    cmds += ["--service-node", "mock", "--service-cluster", "mockcluster"]
    rp = subprocess.run(cmds, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    res = {
        "out": rp.stdout.decode(),
        "err": rp.stderr.decode(),
        "code": rp.returncode,
    }
    os.remove(write_to)
    return as_api_gateway_response(res, 200)


if __name__ == "__main__":
    from pprint import pprint

    with open("tmp/mock.yaml", "r") as f:
        r = f.read()
        e = {"conf": r}
        print(json.dumps(e))
        x = lambda_handler(as_apigateway_event(e), None)
        print("=============== done ===================")
        pprint(x)
