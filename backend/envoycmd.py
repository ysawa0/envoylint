import json
import os
import subprocess
import uuid

from apig import apig_event, apig_resp, init_api_event


def lambda_handler(event, context):
    from pprint import pprint

    pprint(os.listdir("/lib64"))
    pprint(os.listdir("/lib"))
    event = init_api_event(event)

    u = str(uuid.uuid4())
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
    return apig_resp(res, 200)


if __name__ == "__main__":
    from pprint import pprint

    with open("tmp/mock.yaml", "r") as f:
        e = {"conf": f.read()}
        print(json.dumps(e))
        x = lambda_handler(apig_event(e), None)
        print("=============== done ===================")
        pprint(x)
