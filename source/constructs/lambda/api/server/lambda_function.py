# Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: Apache-2.0

import logging
import os
from datetime import datetime, timedelta
import uuid
from enum import Enum


from boto3.dynamodb.conditions import Attr, Key

from commonlib import AWSConnection, handle_error, AppSyncRouter
from commonlib.utils import paginate

import boto3


class ENTITY_TYPE(Enum):
    MARKER = "MARKER"
    PROJECT = "PROJECT"
    TEST = "TEST"
    TEST_ENV = "TEST_ENV"


class ErrorCode(Enum):
    UNSUPPORTED_ACTION = "Unsupported action specified"
    UNKNOWN_ERROR = "Unknown exception occurred"
    VALUE_ERROR = "Value error"

    
class APIException(Exception):
    def __init__(self, code: ErrorCode, message: str = ""):
        self.type = code.name
        self.message = message if message else code.value

    def __str__(self) -> str:
        return f"[{self.type}] {self.message}"
        


metadata_json = {
    "CLO": {
        "region": "ap-southeast-1",
        "branch": "2.1",
        "codecommit_repo": "https://git-codecommit.us-west-2.amazonaws.com/v1/repos/Loghub-test",
    }
}

logger = logging.getLogger()
logger.setLevel(logging.INFO)

conn = AWSConnection()
router = AppSyncRouter()

table_name = os.environ.get("TABLE")
sns_topic_arn = os.environ.get("SNS_TOPIC_ARN")

dynamodb = boto3.resource("dynamodb")
table = dynamodb.Table(table_name)
sns = boto3.client('sns')
codebuild_project = os.environ.get("CODEBUILD_PROJECT_NAME")
current_region = os.environ.get("REGION")
current_partition = os.environ.get("PARTITION")
codebuild_client = boto3.client("codebuild", region_name=current_region)


@handle_error
def lambda_handler(event, _):
    return router.resolve(event)


@router.route(field_name="listTestCheckPoints")
def list_test_checkpoints(page=1, count=20):
    """List test checkpoints"""
    logger.info(
        f"List TestCheckPoints from JSON file in page {page} with {count} of records"
    )

    response = table.scan(
        FilterExpression=Attr("PK").begins_with(f"{ENTITY_TYPE.MARKER.value}#"),
    )

    items = response.get("Items", [])
    total = response.get("Count", 0)

    for item in items:
        pk = item.get("PK", "")
        item["id"] = pk.split("#")[1] if "#" in pk else pk

        history_response = table.query(
            IndexName="sortCreatedAtIndex",
            KeyConditionExpression=Key("SK").eq(
                f"{ENTITY_TYPE.MARKER.value}#{item['id']}"
            ),
            ScanIndexForward=False,
            Limit=1,
        )

        latest_test = history_response.get("Items", [])
        if latest_test:
            item["status"] = latest_test[0].get("status", "UNKNOWN")
        else:
            item["status"] = "UNKNOWN"

    total, checkPoints = paginate(items, page, count, sort_by="id")
    return {
        "total": total,
        "checkPoints": checkPoints,
    }


@router.route(field_name="listTestHistory")
def list_test_history(id, page=1, count=20):
    """List test history"""
    logger.info(f"List history from JSON file in page {page} with {count} of records")

    response = table.query(
        IndexName="sortCreatedAtIndex",
        KeyConditionExpression=Key("SK").eq(f"{ENTITY_TYPE.MARKER.value}#{id}"),
        ScanIndexForward=False,
    )

    items = response.get("Items", [])
    total = response.get("Count", 0)

    for item in items:
        pk = item.get("PK", "")
        item["id"] = pk.split("#")[1] if "#" in pk else pk
        sk = item.get("SK", "")
        item["markerId"] = sk.split("#")[1] if "#" in sk else sk

    total, testHistories = paginate(items, page, count, sort_by="createdAt")

    return {
        "total": total,
        "testHistories": testHistories,
    }


@router.route(field_name="getTestHistory")
def get_test_history(id: str):
    """Get test history for a given ID."""
    logger.info(f"Get test history for ID: {id}")

    try:
        response = table.query(
            KeyConditionExpression=Key("PK").eq(f"{ENTITY_TYPE.TEST.value}#{id}")
        )
        items = response.get("Items", [])

        if items:
            item = items[0]
            pk = item.get("PK", "")
            item["id"] = pk.split("#")[1] if "#" in pk else pk
            sk = item.get("SK", "")
            item["markerId"] = sk.split("#")[1] if "#" in sk else sk

            return item
        else:
            logger.info(f"No test history found for ID: {id}")
            return None

    except Exception as e:
        logger.error(f"Error fetching test history: {e}")
        return None


def pass_parameters_to_codebuild(parameters, project_name):
    codebuild_params_json = {}
    if project_name == "CLO":
        for param in parameters:
            parameter_key = param.get("parameterKey")
            parameter_value = param.get("parameterValue")
            if parameter_key == "buffer":
                codebuild_params_json["buffer_layer"] = parameter_value
            elif parameter_key == "logType":
                codebuild_params_json["log_type"] = parameter_value
            else:
                codebuild_params_json[parameter_key] = parameter_value
    codebuild_params_list = [codebuild_params_json]
    logger.info(f"CodeBuild parameters: {codebuild_params_list}")
    return codebuild_params_list


def update_environment_variables(codebuild_project, environment_variables):
    project_info = codebuild_client.batch_get_projects(names=[codebuild_project])
    current_environment_variables = project_info["projects"][0]["environment"][
        "environmentVariables"
    ]
    for variable in environment_variables:
        variable_name = variable["name"]
        variable_value = variable["value"]

        existing_variable = next(
            (
                var
                for var in current_environment_variables
                if var["name"] == variable_name
            ),
            None,
        )
        if existing_variable:
            existing_variable["value"] = variable_value
        else:
            current_environment_variables.append(
                {"name": variable_name, "value": variable_value}
            )
    response = codebuild_client.update_project(
        name=codebuild_project,
        environment={
            "type": "LINUX_CONTAINER",
            "image": "aws/codebuild/standard:5.0",
            "imagePullCredentialsType": "CODEBUILD",
            "computeType": "BUILD_GENERAL1_SMALL",
            "environmentVariables": current_environment_variables,
        },
    )
    print(response)


@router.route(field_name="startSingleTest")
def start_single_task(**args):
    """Start single test task"""
    logger.info(f"Starting task with args: {args}")
    marker_id = args.get("markerId")
    # check if there is running deamonset case
    search_deamonset = table.query(
        IndexName="sortCreatedAtIndex",
        KeyConditionExpression=Key("SK").eq(f"{ENTITY_TYPE.MARKER.value}#{marker_id}"),
        ScanIndexForward=False,
    )
    
    half_hour_ago = datetime.utcnow() - timedelta(minutes=30)
    items = search_deamonset.get("Items", [])
    if items:
        for item in items:
            status = item.get("status", "")
            operate_time = item.get("createdAt", "")
            timestamp = datetime.strptime(operate_time, "%Y-%m-%dT%H:%M:%SZ")
            timestamp_dt = datetime.fromtimestamp(timestamp.timestamp())
            
            if status == 'RUNNING' and timestamp_dt > half_hour_ago:
                raise APIException(ErrorCode.UNKNOWN_ERROR, "Deamonset case is running. Please wait for finishing and start again!")

    parameters = args.get("parameters")
    pk_id = str(uuid.uuid4())
    search_response = table.query(
        KeyConditionExpression=Key("PK").eq(f"{ENTITY_TYPE.MARKER.value}#{marker_id}")
    )
    
    items = search_response.get("Items", [])
    if items:
        item = items[0]
        mark = item.get("modelName", "")
        project_name = item.get("projectName", "")
    codebuild_params_list = pass_parameters_to_codebuild(parameters, project_name)
    codecommit_repo = metadata_json[project_name]["codecommit_repo"]
    branch = metadata_json[project_name]["branch"]
    region = metadata_json[project_name]["region"]
    parameters_parsed = []
    environment_variables = [
        {"name": "code_commit_repo", "value": codecommit_repo},
        {"name": "branch", "value": branch},
        {"name": "mark", "value": mark},
        {"name": "parameter", "value": f"{codebuild_params_list}"},
        {"name": "region", "value": region},
        {"name": "project_name", "value": project_name},
        {"name": "pk", "value": f"{ENTITY_TYPE.TEST.value}#{pk_id}"},
        {"name": "sk", "value": f"{ENTITY_TYPE.MARKER.value}#{marker_id}"},
    ]

    update_environment_variables(codebuild_project, environment_variables)
    start_build_response = codebuild_client.start_build(projectName=codebuild_project)
    codebuild_arn = start_build_response['build']['arn']

    print("CodeBuild triggered:", start_build_response)

    if parameters:
        for param in parameters:
            parameter_key = param.get("parameterKey")
            parameter_value = param.get("parameterValue")
            if parameter_key and parameter_value:
                parameters_parsed.append(
                    {"parameterKey": parameter_key, "parameterValue": parameter_value}
                )

    current_timestamp = datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%SZ")
    ddb_data = {
        "PK": f"{ENTITY_TYPE.TEST.value}#{pk_id}",
        "SK": f"{ENTITY_TYPE.MARKER.value}#{marker_id}",
        "createdAt": current_timestamp,
        "updatedAt": current_timestamp,
        "duration": "-",
        "metaData": {
            "accountId": "691546483958",
            "region": "ap-northeast-1",
            "stackName": "clo-auto-test",
        },
        "parameters": parameters_parsed,
        "status": "RUNNING",
        "codeBuildArn": codebuild_arn
    }

    response = table.put_item(Item=ddb_data)

    if response:
        print(f"Data written to DDB successfully. PK: {ddb_data['PK']}")
        return pk_id
    else:
        print("Failed to write data to DDB.")
        return None


@router.route(field_name="importTestEnv")
def import_env(**args):
    """import test env"""
    logger.info(f"import env args: {args}")
    env_name = args.get("envName")
    stack_name = args.get("stackName")
    region = args.get("region")
    account_id = args.get("accountId", "691546483958")
    email = args.get("alarmEmail")
    project_id = args.get("projectId", "775ab001-rety-ghkl-poiu-123597a8zxcv")
    env_id = f"{env_name}-{str(uuid.uuid4())}"
    # create subscription
    response = sns.subscribe(
    TopicArn=sns_topic_arn,
    Protocol='email',
    Endpoint=email
    )
    subscription_arn = response['SubscriptionArn']
    ddb_data = {
        "PK": f"{ENTITY_TYPE.TEST_ENV.value}#{env_id}",
        "SK": f"{ENTITY_TYPE.PROJECT.value}#{project_id}",
        "envName": env_name,
        "stackName": stack_name,
        "region": region,
        "accountId": account_id,
        "alarmEmail": email,
        "subscriptionArn": subscription_arn
    }
    response = table.put_item(Item=ddb_data)

    if response:
        print(f"Data written to DDB successfully. PK: {ddb_data['PK']}")
        return env_id
    else:
        print("Failed to write data to DDB.")
        return None


 



    
    