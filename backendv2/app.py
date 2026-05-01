#!/usr/bin/env python3
import json
import os

import aws_cdk as cdk
from aws_cdk import CfnOutput, Duration, Stack
from aws_cdk import aws_apigateway as apigateway
from aws_cdk import aws_lambda as _lambda
from aws_cdk import aws_logs as logs
from constructs import Construct


class EnvoylintV2Stack(Stack):
    def __init__(self, scope: Construct, construct_id: str, **kwargs) -> None:
        super().__init__(scope, construct_id, **kwargs)

        # Create Lambda layer with shared libraries
        shared_libs_layer = _lambda.LayerVersion(
            self,
            "SharedLibsLayer",
            code=_lambda.Code.from_asset("./layer"),
            compatible_runtimes=[_lambda.Runtime.PYTHON_3_13],
            compatible_architectures=[_lambda.Architecture.X86_64],
            description="Shared libraries layer for Envoy validator",
        )

        # Create Lambda function (back to ZIP package)
        validator_function = _lambda.Function(
            self,
            "EnvoyValidator",
            runtime=_lambda.Runtime.PYTHON_3_13,
            handler="handler.validate",
            code=_lambda.Code.from_asset("./lambda"),
            timeout=Duration.seconds(30),
            memory_size=256,
            architecture=_lambda.Architecture.X86_64,
            layers=[shared_libs_layer],
            environment={
                "VERSIONS_CONFIG": json.dumps(
                    {
                        "1.34.1": {
                            "url": "https://github.com/envoyproxy/envoy/releases/download/v1.34.1/envoy-contrib-1.34.1-linux-aarch_64"
                        },
                    }
                ),
            },
        )

        # Set CloudWatch logs retention to 1 day (minimum supported by AWS)
        # Note: AWS CloudWatch doesn't support 30-minute retention, minimum is 1 day
        logs.LogGroup(
            self,
            "EnvoyValidatorLogGroup", 
            log_group_name=f"/aws/lambda/{validator_function.function_name}",
            retention=logs.RetentionDays.ONE_DAY,
            removal_policy=cdk.RemovalPolicy.DESTROY
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

        # Output the Lambda layer ARN
        CfnOutput(
            self, "SharedLibsLayerArn", value=shared_libs_layer.layer_version_arn, description="Shared libraries layer ARN"
        )


# CDK App
app = cdk.App()
EnvoylintV2Stack(
    app,
    "EnvoylintV2Stack",
    env=cdk.Environment(account=os.getenv("CDK_DEFAULT_ACCOUNT"), region=os.getenv("CDK_DEFAULT_REGION", "us-east-1")),
)

app.synth()
