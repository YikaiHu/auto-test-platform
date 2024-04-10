# Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: Apache-2.0

import logging
import os
import json
import boto3
from datetime import datetime
from enum import Enum
from boto3.dynamodb.conditions import Attr, Key

s3 = boto3.client("s3")
dynamodb = boto3.resource("dynamodb")

logger = logging.getLogger()
logger.setLevel(logging.INFO)

ddb_table_name = os.environ["TABLE"]
# sns_topic_arn = os.environ["SNS_TOPIC_ARN"]
ddb_table = dynamodb.Table(ddb_table_name)


class ENTITY_TYPE(Enum):
    MARKER = "MARKER"
    PROJECT = "PROJECT"
    TEST = "TEST"
    TEST_ENV = "TEST_ENV"

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

            # send report email 
            send_email_report(pk)

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
    

def send_email_report(test_pk):
    subject = "Test Result from Auto Test Platform"
    print(f'send email report: {test_pk}')
    # get marker and env
    response = ddb_table.query(
            KeyConditionExpressionf=Key("PK").eq(test_pk)
        )
    items = response.get("Items", [])
    if items:
        item = items[0]
        marker_id = item.get("SK", "")
        env_id = item.get("testEnvId", "")
        result = item.get("status", "")
        parameters = item.get("parameters", "")
        trace = item.get("result", "")
    # get project and module according to marker
    search_marker = ddb_table.query(
            KeyConditionExpression=Key("PK").eq(marker_id),
        )
    items = search_marker.get("Items", [])
    if items:
        item = items[0]
        project_name = item.get("projectName", "")
        model_name = item.get("modelName", "")

    # get topic arn according to env id
    search_env = ddb_table.query(
            KeyConditionExpression=Key("PK").eq(f"{ENTITY_TYPE.TEST_ENV.value}#{env_id}"),
        )
    items = search_env.get("Items", [])
    if items:
        item = items[0]
        topic_arn = item.get("topicArn", "")
    
    if "FAILED" in result:
        result = "❌ FAILED"
    else:
        result = "✅ PASS"
    
    text_body = f""" Project: {project_name} \n Model: {model_name}\n Test Parameters: {parameters}\n """ + f"""Result: {result}\n """ + f"""Trace: {trace}"""
    response = sns.publish(
        TopicArn= topic_arn,
        Message=text_body,
        Subject=subject,
        MessageStructure='text/html'
    )
    print(response)


