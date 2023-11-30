# Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: Apache-2.0

import logging
import os
import json

from boto3.dynamodb.conditions import Attr

from commonlib import AWSConnection, handle_error, AppSyncRouter
from commonlib import DynamoDBUtil
from commonlib.utils import paginate


logger = logging.getLogger()
logger.setLevel(logging.INFO)

conn = AWSConnection()
router = AppSyncRouter()

table_name = os.environ.get("TABLE")
ddb_util = DynamoDBUtil(table_name)


current_region = os.environ.get("REGION")
current_partition = os.environ.get("PARTITION")


@handle_error
def lambda_handler(event, _):
    return router.resolve(event)


@router.route(field_name="getTestCheckPoint")
def get_test_checkpoint(id: str):
    """Get a service pipeline detail"""
    pk = "TEST_CHECKPOINT"
    sk = f"TEST_CHECKPOINT_ID#{id}"
    item = ddb_util.get_item({"PK": pk, "SK": sk})

    return item


@router.route(field_name="listTestCheckPoints")
def list_test_checkpoints(page=1, count=20):
    """List test checkpoints"""
    logger.info(
        f"List TestCheckPoints from JSON file in page {page} with {count} of records"
    )

    with open("test_tasks.json", "r") as json_file:
        items = json.load(json_file)

    for item in items:
        # Here we set the status to UNKNOWN for all test checkpoints
        # we will get these status from DynamoDB
        item["status"] = "UNKNOWN"

    total, checkPoints = paginate(items, page, count, sort_by="id")
    return {
        "total": total,
        "checkPoints": checkPoints,
    }


@router.route(field_name="startSingleTest")
def start_single_task(**args):
    """Start single test task"""
    project_name = args.get("projectName")
    marker = args.get("marker")
    params = args.get("parameters")

    logger.info(
        f"Start single test task {project_name} with marker {marker} and parameters {params}"
    )
    pass


@router.route(field_name="getTestResult")
def get_test_result(task_name: str):
    """Get test result"""
    logger.info(f" Get test result {task_name}")
    pass
