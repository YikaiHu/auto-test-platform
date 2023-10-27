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

import { CfnOutput } from "aws-cdk-lib";
import { IVpc } from "aws-cdk-lib/aws-ec2";
import { Construct } from "constructs";

import { AppSyncStack } from "./appsync-stack";
import { ServiceStack } from "./service-stack";

export interface APIProps {
  /**
   * Cognito User Pool for Authentication of APIs
   *
   * @default - None.
   */
  readonly userPoolId: string;

  /**
   * Cognito User Pool Client for Authentication of APIs
   *
   * @default - None.
   */
  readonly userPoolClientId: string;

  /**
   * VPC
   *
   */
  readonly vpc: IVpc;

  /**
   * Default Subnet Ids (Private)
   *
   */
  readonly subnetIds: string[];

  /**
   * Processing SecurityGroup Id
   *
   */
  readonly processSgId: string;

  /**
   * Authentication Type
   *
   */
  readonly authType: string;

  /**
   * OIDC Provider
   *
   */
  readonly oidcProvider: string;

  /**
   * OIDC Client Id
   *
   */
  readonly oidcClientId: string;

  readonly stackPrefix: string;
}

/**
 * Entrance for All backend APIs related resources.
 */
export class APIStack extends Construct {
  readonly apiEndpoint: string;
  // readonly graphqlApi: appsync.GraphqlApi;

  constructor(scope: Construct, id: string, props: APIProps) {
    super(scope, id);

    const apiStack = new AppSyncStack(this, "AppSyncStack", {
      authType: props.authType,
      oidcProvider: props.oidcProvider,
      oidcClientId: props.oidcClientId,
      userPoolId: props.userPoolId,
      userPoolClientId: props.userPoolClientId,
    });

    new ServiceStack(this, "ServiceStack", {
      graphqlApi: apiStack.graphqlApi,
    });

    new CfnOutput(this, "GraphQLAPIEndpoint", {
      description: "GraphQL API Endpoint (back-end)",
      value: apiStack.graphqlApi.graphqlUrl,
    }).overrideLogicalId("GraphQLAPIEndpoint");

    this.apiEndpoint = apiStack.graphqlApi.graphqlUrl;
  }
}
