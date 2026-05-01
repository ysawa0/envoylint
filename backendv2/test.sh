curl -X POST 'https://h8sb10yby3.execute-api.us-east-1.amazonaws.com/prod/validate/1.34.1' \
                    -H 'Content-Type: application/json' \
                    -d '{
                  "conf": "static_resources:\n  listeners:\n  - name: listener_0\n    address:\n      socket_address:\n        address: 0.0.0.0\n        port_value: 10000"
                }'
 aws logs tail /aws/lambda/EnvoylintV2Stack-EnvoyValidator7379BAD9-CTH7Ay9di7l9 --since 5m
