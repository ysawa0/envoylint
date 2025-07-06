#!/usr/bin/env python3
import os

import aws_cdk as cdk
from envoylintv2_stack import EnvoylintV2Stack

app = cdk.App()
EnvoylintV2Stack(
    app,
    "EnvoylintV2Stack",
    env=cdk.Environment(account=os.getenv("CDK_DEFAULT_ACCOUNT"), region=os.getenv("CDK_DEFAULT_REGION", "us-east-1")),
)

app.synth()
