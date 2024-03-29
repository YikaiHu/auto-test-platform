# Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: Apache-2.0

import logging
import os
import json
import boto3
from datetime import datetime

s3 = boto3.client("s3")
dynamodb = boto3.resource("dynamodb")

logger = logging.getLogger()
logger.setLevel(logging.INFO)

ddb_table_name = os.environ["TABLE"]
ddb_table = dynamodb.Table(ddb_table_name)


def lambda_handler(event, context):
    for record in event["Records"]:
        bucket = record["s3"]["bucket"]["name"]
        key = record["s3"]["object"]["key"]

        try:
            response = s3.get_object(Bucket=bucket, Key=key)
            test_result = response["Body"].read().decode("utf-8")
            parsed_data = json.loads(test_result)
            print(parsed_data)
            pk = parsed_data['pk']
            sk = parsed_data['sk']
            parsed_result = parse_test_result(parsed_data)          

            expression_attribute_names = {
                '#status': 'status', 
                '#failed': 'failed', 
                '#passed': 'passed', 
                '#total': 'total', 
                '#updatedAt': 'updatedAt', 
                '#duration': 'duration', 
                '#result': 'result'}
            update_expression = 'SET #status = :value1, #failed = :value2, #passed = :value3, #total = :value4, #updatedAt = :value5, #duration = :value6, #result = :value7'
            expression_attribute_values = {
                ':value1': parsed_result['status'], 
                ':value2': parsed_result['failed'],
                ':value3': parsed_result['passed'],
                ':value4': parsed_result['total'],
                ':value5': parsed_result['updatedAt'],
                ':value6': parsed_result['duration'],
                ':value7': parsed_result['result']}

            response = ddb_table.update_item(
                # TableName=table_name,
                Key={'PK': pk, 'SK': sk},
                UpdateExpression=update_expression,
                ExpressionAttributeValues=expression_attribute_values,
                ExpressionAttributeNames=expression_attribute_names,
                ReturnValues='ALL_NEW'  
            )
            print(response['Attributes'])
        except Exception as e:
            print(f"Error: {str(e)}")


def parse_test_result(parsed_data):
    """Parse test result"""
    current_timestamp = datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%SZ")
    print(parsed_data)
    ddb_data = {}
    summary_result = parsed_data['summary']
    test_detail = parsed_data['tests']
    if 'failed' in summary_result:
        ddb_data['failed'] = summary_result['failed']
    else:
        ddb_data['failed'] = 0
    if 'passed' in summary_result:
        ddb_data['passed'] = summary_result['passed']
    else:
        ddb_data['passed'] = 0
    ddb_data['total'] = summary_result['total']
    if ddb_data['total'] == ddb_data['passed']:
        ddb_data['status'] = 'PASS'
    else:
        ddb_data['status'] = 'FAILED'
    ddb_data['updatedAt'] = current_timestamp
    ddb_data['duration'] = int(parsed_data['duration'])
    results = []
    for each in test_detail:
        result = {}
        node_id = each['nodeid']
        call = each['call']
        outcome = call['outcome']
        if 'crash' in call.keys():
            result['message'] = call['crash']['message']
        else:
            result['message'] = '-'
        if 'longrepr' in call.keys():
            result['trace'] = call['longrepr']
        else:
            result['trace'] = '-'
        results.append(result)
    ddb_data['result'] = results
    return ddb_data
    
        