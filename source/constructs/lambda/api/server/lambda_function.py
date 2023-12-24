# Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: Apache-2.0

import logging
import os
import json
from enum import Enum

from boto3.dynamodb.conditions import Attr, Key

from commonlib import AWSConnection, handle_error, AppSyncRouter
from commonlib.utils import paginate

import boto3


class ENTITY_TYPE(Enum):
    MARKER = "MARKER"
    PROJECT = "PROJECT"
    TEST = "TEST"


logger = logging.getLogger()
logger.setLevel(logging.INFO)

conn = AWSConnection()
router = AppSyncRouter()

table_name = os.environ.get("TABLE")

dynamodb = boto3.resource("dynamodb")
table = dynamodb.Table(table_name)


current_region = os.environ.get("REGION")
current_partition = os.environ.get("PARTITION")


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
        Limit=count,
    )

    items = response.get("Items", [])
    total = response.get("Count", 0)

    for item in items:
        pk = item.get("PK", "")
        item["id"] = pk.split("#")[1] if "#" in pk else pk

        history_response = table.query(
            IndexName="reverseLookup",
            KeyConditionExpression=Key("SK").eq(f"{ENTITY_TYPE.MARKER.value}#{item['id']}"),
            ScanIndexForward=False,
            Limit=1
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
        IndexName="reverseLookup",
        KeyConditionExpression=Key("SK").eq(f"{ENTITY_TYPE.MARKER.value}#{id}"),
        Limit=count,
    )

    items = response.get("Items", [])
    total = response.get("Count", 0)

    for item in items:
        pk = item.get("PK", "")
        item["id"] = pk.split("#")[1] if "#" in pk else pk
        sk = item.get("SK", "")
        item["markerId"] = sk.split("#")[1] if "#" in sk else sk

    total, testHistories = paginate(items, page, count, sort_by="id")
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
            KeyConditionExpression=Key('PK').eq(f"{ENTITY_TYPE.TEST.value}#{id}")
        )
        items = response.get('Items', [])

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
