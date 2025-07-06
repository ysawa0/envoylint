#!/usr/bin/env python3
import json
import os

import aws_cdk as cdk
from aws_cdk import CfnOutput, Duration, Stack
from aws_cdk import aws_apigateway as apigateway
from aws_cdk import aws_lambda as _lambda
from constructs import Construct


class EnvoylintV2Stack(Stack):
    def __init__(self, scope: Construct, construct_id: str, **kwargs) -> None:
        super().__init__(scope, construct_id, **kwargs)

        # Create Lambda function
        validator_function = _lambda.Function(
            self,
            "EnvoyValidator",
            runtime=_lambda.Runtime.PYTHON_3_11,
            handler="handler.validate",
            code=_lambda.Code.from_asset("./lambda"),
            timeout=Duration.seconds(30),
            memory_size=256,
            architecture=_lambda.Architecture.X86_64,
            environment={
                "VERSIONS_CONFIG": json.dumps(
                    {
                        "1.34.0": {
                            "url": "https://github.com/envoyproxy/envoy/releases/download/v1.34.0/envoy-contrib-1.34.0-linux-x86_64"
                        },
                        "1.34.1": {
                            "url": "https://github.com/envoyproxy/envoy/releases/download/v1.34.1/envoy-contrib-1.34.1-linux-x86_64"
                        },
                    }
                )
            },
        )

        # Create API Gateway
        api = apigateway.RestApi(
            self,
            "EnvoyValidatorApi",
            rest_api_name="EnvoyLint V2 API",
            description="Envoy configuration validator for newer versions",
            default_cors_preflight_options=apigateway.CorsOptions(
                allow_origins=["*"],
                allow_methods=["POST", "OPTIONS"],
                allow_headers=["Content-Type", "X-Amz-Date", "Authorization", "X-Api-Key"],
            ),
        )

        # Create /validate resource
        validate_resource = api.root.add_resource("validate")

        # Create /{version} resource under /validate
        version_resource = validate_resource.add_resource("{version}")

        # Create Lambda integration
        lambda_integration = apigateway.LambdaIntegration(validator_function)

        # Add POST method
        version_resource.add_method("POST", lambda_integration)

        # Output the API URL
        CfnOutput(self, "ApiUrl", value=api.url, description="API Gateway URL")

        # Output the Lambda function name
        CfnOutput(
            self, "LambdaFunctionName", value=validator_function.function_name, description="Lambda function name"
        )


# CDK App
app = cdk.App()
EnvoylintV2Stack(
    app,
    "EnvoylintV2Stack",
    env=cdk.Environment(account=os.getenv("CDK_DEFAULT_ACCOUNT"), region=os.getenv("CDK_DEFAULT_REGION", "us-east-1")),
)

app.synth()
