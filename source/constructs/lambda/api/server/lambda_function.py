# Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: Apache-2.0

import logging
import os

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
    pk = f"TEST_CHECKPOINT#{id}"
    item = ddb_util.get_item({"PK": pk})

    return item


@router.route(field_name="listTestCheckPoints")
def list_test_checkpoints(page=1, count=20):
    """ List test checkpoints """
    logger.info(f"List TestCheckPoints from DynamoDB in page {page} with {count} of records")

    items = ddb_util.list_items(filter_expression=Attr("status").ne("INACTIVE"))
    total, pipelines = paginate(items, page, count, sort_by="createdAt")
    return {
        "total": total,
        "pipelines": pipelines,
    }
