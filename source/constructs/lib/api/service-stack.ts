/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.

Licensed under the Apache License, Version 2.0 (the "License").
You may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/
import * as path from "path";
import * as appsync from "@aws-cdk/aws-appsync-alpha";
import {
  Aws,
  Duration,
  RemovalPolicy,
  aws_codebuild as codebuild,
  aws_dynamodb as ddb,
  aws_iam as iam,
  aws_lambda as lambda,
  aws_s3 as s3,
  aws_s3_notifications as s3n,
} from "aws-cdk-lib";
import { Construct } from "constructs";

import { SharedPythonLayer } from "../layer/layer";

export interface SvcStackProps {
  readonly graphqlApi: appsync.GraphqlApi;
  readonly codeBuildProject: codebuild.PipelineProject;
  readonly centralBucket: s3.Bucket;
}
export class ServiceStack extends Construct {
  readonly svcTable: ddb.Table;

  constructor(scope: Construct, id: string, props: SvcStackProps) {
    super(scope, id);

    // Create a table to store logging  info
    this.svcTable = new ddb.Table(this, "ServiceStack", {
      partitionKey: {
        name: "PK",
        type: ddb.AttributeType.STRING,
      },
      sortKey: {
        name: "SK",
        type: ddb.AttributeType.STRING,
      },
      billingMode: ddb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: RemovalPolicy.DESTROY,
      encryption: ddb.TableEncryption.DEFAULT,
      pointInTimeRecovery: true,
      timeToLiveAttribute: "ttl",
    });

    this.svcTable.addGlobalSecondaryIndex({
      indexName: 'reverseLookup',
      partitionKey: { name: 'SK', type: ddb.AttributeType.STRING },
      sortKey: { name: 'PK', type: ddb.AttributeType.STRING },
      projectionType: ddb.ProjectionType.ALL,
    });

    // Create a lambda to handle all related APIs.
    const svcHandler = new lambda.Function(this, "ServiceHandler", {
      code: lambda.AssetCode.fromAsset(
        path.join(__dirname, "../../lambda/api/server")
      ),
      runtime: lambda.Runtime.PYTHON_3_11,
      handler: "lambda_function.lambda_handler",
      timeout: Duration.seconds(60),
      memorySize: 1024,
      layers: [SharedPythonLayer.getInstance(this)],
      environment: {
        TABLE: this.svcTable.tableName,
        SOLUTION_VERSION: process.env.VERSION || "v1.0.0",
        ACCOUNT_ID: Aws.ACCOUNT_ID,
        REGION: Aws.REGION,
        PARTITION: Aws.PARTITION,
        CODEBUILD_PROJECT_NAME: props.codeBuildProject.projectName,
      },
      description: `${Aws.STACK_NAME} - APIs Resolver`,
    });

    // Grant permissions to the pipeline lambda
    this.svcTable.grantReadWriteData(svcHandler);

    const svcFnPolicy = new iam.Policy(this, "SvcFnPolicy", {
      statements: [
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          resources: ["*"],
          actions: ["*"],
        }),
      ],
    });
    svcHandler.role!.attachInlinePolicy(svcFnPolicy);

    // Add pipeline lambda as a Datasource
    const svcLambdaDS = props.graphqlApi.addLambdaDataSource(
      "SvcLambdaDS",
      svcHandler,
      {
        description: "Lambda Resolver Datasource",
      }
    );

    // Set resolver for releted cluster API methods
    svcLambdaDS.createResolver("listTestCheckPoints", {
      typeName: "Query",
      fieldName: "listTestCheckPoints",
      requestMappingTemplate: appsync.MappingTemplate.lambdaRequest(),
      responseMappingTemplate: appsync.MappingTemplate.lambdaResult(),
    });

    svcLambdaDS.createResolver("getTestCheckPoint", {
      typeName: "Query",
      fieldName: "getTestCheckPoint",
      requestMappingTemplate: appsync.MappingTemplate.lambdaRequest(),
      responseMappingTemplate: appsync.MappingTemplate.lambdaResult(),
    });

    svcLambdaDS.createResolver("startSingleTest", {
      typeName: "Mutation",
      fieldName: "startSingleTest",
      requestMappingTemplate: appsync.MappingTemplate.lambdaRequest(),
      responseMappingTemplate: appsync.MappingTemplate.lambdaResult(),
    });

    // Set parser for test result
    const testResultParser = new lambda.Function(this, "TestResultParser", {
      code: lambda.AssetCode.fromAsset(
        path.join(__dirname, "../../lambda/api/parser")
      ),
      runtime: lambda.Runtime.PYTHON_3_11,
      handler: "lambda_function.lambda_handler",
      timeout: Duration.minutes(5),
      memorySize: 1024,
      layers: [SharedPythonLayer.getInstance(this)],
      environment: {
        TABLE: this.svcTable.tableName,
        SOLUTION_VERSION: process.env.VERSION || "v1.0.0",
        ACCOUNT_ID: Aws.ACCOUNT_ID,
        REGION: Aws.REGION,
        PARTITION: Aws.PARTITION,
        CODEBUILD_PROJECT_NAME: props.codeBuildProject.projectName,
      },
      description: `${Aws.STACK_NAME} - Test Result Parser`,
    });
    const parserFnPolicy = new iam.Policy(this, "ParserFnPolicy", {
      statements: [
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          resources: ["*"],
          actions: ["*"],
        }),
      ],
    });
    testResultParser.role!.attachInlinePolicy(parserFnPolicy);

    // Add the S3 event on the central bucket with the target TestResultParser
    props.centralBucket.addEventNotification(
      s3.EventType.OBJECT_CREATED,
      new s3n.LambdaDestination(testResultParser),
      {
        prefix: 'test_result/',
      }
    );
  }
}
