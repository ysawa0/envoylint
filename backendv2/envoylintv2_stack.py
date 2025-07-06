import json

from aws_cdk import CfnOutput, Duration, RemovalPolicy, Stack
from aws_cdk import aws_apigateway as apigateway
from aws_cdk import aws_lambda as _lambda
from aws_cdk import aws_logs as logs
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
            memory_size=1024,
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

        # Create log group with retention policy
        log_group = logs.LogGroup(
            self,
            "EnvoyValidatorLogGroup",
            log_group_name=f"/aws/lambda/{validator_function.function_name}",
            retention=logs.RetentionDays.ONE_WEEK,
            removal_policy=RemovalPolicy.DESTROY,
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
