#!/usr/bin/env python3
import os
from pathlib import Path

import aws_cdk as cdk
from aws_cdk import CfnOutput, Duration, Stack
from aws_cdk import aws_apigateway as apigateway
from aws_cdk import aws_lambda as lambda_
from aws_cdk import aws_logs as logs
from constructs import Construct

VERSIONS = {
    "1.12.7": "1127",
    "1.13.4": "1134",
    "1.14.5": "1145",
    "1.15.2": "1152",
    "1.16.2": "1162",
    "1.17.1": "1171",
    "1.18.2": "1182",
    "1.19.0": "1190",
    "1.20.0": "1200",
    "1.21.0": "1210",
    "1.22.0": "1220",
    "1.23.1": "1231",
    "1.28.0": "1280",
}


class EnvoylintV3Stack(Stack):
    def __init__(self, scope: Construct, construct_id: str, **kwargs) -> None:
        super().__init__(scope, construct_id, **kwargs)

        root = Path(__file__).parent
        backend = root.parent / "backend"

        api = apigateway.RestApi(
            self,
            "Api",
            rest_api_name="EnvoyLint V3 API",
            default_cors_preflight_options=apigateway.CorsOptions(
                allow_origins=["*"],
                allow_methods=["POST", "OPTIONS"],
                allow_headers=["Content-Type", "X-Amz-Date", "Authorization", "X-Api-Key"],
            ),
        )

        lib_layer = lambda_.LayerVersion(
            self,
            "Libatomic",
            code=lambda_.Code.from_asset(str(backend / "lib")),
            compatible_architectures=[lambda_.Architecture.X86_64],
            compatible_runtimes=[lambda_.Runtime.PYTHON_3_11],
            description="Shared libraries for Envoy binaries",
        )

        for version, suffix in VERSIONS.items():
            layer = lambda_.LayerVersion(
                self,
                f"Envoy{suffix}",
                code=lambda_.Code.from_asset(str(backend / "bin" / f"envoy-{version}")),
                compatible_architectures=[lambda_.Architecture.X86_64],
                compatible_runtimes=[lambda_.Runtime.PYTHON_3_11],
                description=f"Envoy {version} binary",
            )

            function = lambda_.Function(
                self,
                f"Validator{suffix}",
                runtime=lambda_.Runtime.PYTHON_3_11,
                architecture=lambda_.Architecture.X86_64,
                handler="handler.handler",
                code=lambda_.Code.from_asset(str(root / "lambda")),
                timeout=Duration.seconds(30),
                memory_size=256,
                layers=[layer, lib_layer],
                environment={"LD_LIBRARY_PATH": "/opt/lib:/opt/lib64"},
            )

            logs.LogGroup(
                self,
                f"Validator{suffix}Logs",
                log_group_name=f"/aws/lambda/{function.function_name}",
                retention=logs.RetentionDays.ONE_DAY,
                removal_policy=cdk.RemovalPolicy.DESTROY,
            )

            api.root.add_resource(f"envoyv{suffix}").add_method("POST", apigateway.LambdaIntegration(function))

        CfnOutput(self, "ApiUrl", value=api.url, description="API Gateway URL")


app = cdk.App()
EnvoylintV3Stack(
    app,
    "EnvoylintV3Stack",
    env=cdk.Environment(account=os.getenv("CDK_DEFAULT_ACCOUNT"), region=os.getenv("CDK_DEFAULT_REGION", "us-east-1")),
)
app.synth()
