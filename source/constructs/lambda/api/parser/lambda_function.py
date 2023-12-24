# Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: Apache-2.0

import logging
import os
import json
import boto3

s3 = boto3.client("s3")
dynamodb = boto3.resource("dynamodb")

logger = logging.getLogger()
logger.setLevel(logging.INFO)

ddb_table_name = os.environ["DDB_TABLE_NAME"]
ddb_table = dynamodb.Table(ddb_table_name)


def lambda_handler(event, context):
    for record in event["Records"]:
        bucket = record["s3"]["bucket"]["name"]
        key = record["s3"]["object"]["key"]

        try:
            response = s3.get_object(Bucket=bucket, Key=key)
            test_result = response["Body"].read().decode("utf-8")

            parsed_result = parse_test_result(test_result)
            # Please modify the following code to save the parsed result to DynamoDB
            ddb_table.put_item(Item={"testId": key, "result": parsed_result})
        except Exception as e:
            print(f"Error: {str(e)}")


def parse_test_result(test_result):
    """Parse test result"""
    parsed_data = json.loads(test_result)
    return parsed_data
