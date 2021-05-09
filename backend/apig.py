import json
from typing import Union


class APIGatewayEvent:
    def __init__(self, event: dict):
        self.event = event
        self.headers = event.get("headers", {})

        path = event.get("path", "")  # ex: "/qa"
        if path.endswith("/"):
            path = path[:-1]
        self.path = path

        if event["body"]:
            try:
                payload = json.loads(event["body"])
            except json.JSONDecodeError as e:
                raise ValueError(f"JSON validation failed. Invalid JSON most likely, {type(e)}, {e}")
        else:
            payload = {}

        self.payload = payload
        self.debug = payload.get("debug", False)

    def __str__(self) -> str:
        s = f"APIGatewayEvent: {self.headers}, {self.path}, {self.payload}"
        return s


def apig_event(body: dict) -> dict:
    return {"body": json.dumps(body)}


def init_api_event(event: dict) -> APIGatewayEvent:
    """ Take API Gateway event from lambda_handler and parse it"""
    return APIGatewayEvent(event)


def apig_resp(body: Union[dict, list, str], status: int, resp_type: str = "json") -> dict:
    headers = {
        "Access-Control-Allow-Origin": "*",  # Required for CORS support to work
        "Access-Control-Allow-Credentials": True,  # Required for cookies, authorization headers with HTTPS
    }

    if resp_type == "json":
        if isinstance(body, dict):
            body = json.dumps(body, default=str)
        else:
            body = json.dumps({"status": body}, default=str)
    elif resp_type == "text":
        headers["Content-Type"] = "text/plain"
    else:
        pass

    return {
        "statusCode": status,
        "headers": headers,
        "body": body,
        "isBase64Encoded": False,
    }


if __name__ == "__main__":
    pass
