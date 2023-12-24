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

import {
  CfnParameter,
  CfnResource,
  CfnOutput,
  Stack,
  StackProps,
  aws_s3 as s3,
  RemovalPolicy,
} from "aws-cdk-lib";
import { NagSuppressions } from "cdk-nag";
import { Construct } from "constructs";
import { APIStack } from "./api/api-stack";
import { AuthStack } from "./main/auth-stack";

import { CustomResourceStack } from "./main/cr-stack";
import { PortalStack } from "./main/portal-stack";
import { VpcStack } from "./main/vpc-stack";
import { WorkerStack, WorkerProps } from "./main/worker-stack";

const { VERSION } = process.env;

/**
 * cfn-nag suppression rule interface
 */
interface CfnNagSuppressRule {
  readonly id: string;
  readonly reason: string;
}

export function addCfnNagSuppressRules(
  resource: CfnResource,
  rules: CfnNagSuppressRule[]
) {
  resource.addMetadata("cfn_nag", {
    rules_to_suppress: rules,
  });
}

export interface MainProps extends StackProps {
  solutionName?: string;
  solutionDesc?: string;
  solutionId?: string;

  /**
   * Indicate whether to create a new VPC or use existing VPC for this Solution
   *
   * @default - false.
   */
  existingVpc?: boolean;
  /**
   * Indicate the auth type in which main stack uses
   */
  authType?: string;
}

export const enum AuthType {
  COGNITO = "AMAZON_COGNITO_USER_POOLS",
  OIDC = "OPENID_CONNECT",
}

/**
 * Main Stack
 */
export class MainStack extends Stack {
  private paramGroups: any[] = [];
  private paramLabels: any = {};

  //Default value for authType - cognito
  private authType = "AMAZON_COGNITO_USER_POOLS";
  private userPoolId = "";
  private userPoolClientId = "";
  private oidcProvider = "";
  private oidcClientId = "";
  private oidcCustomerDomain = "";
  private iamCertificateId = "";
  private acmCertificateArn = "";
  private flbConfUploadingEventQueueArn = "";

  constructor(scope: Construct, id: string, props: MainProps) {
    super(scope, id, props);

    let solutionName = props.solutionName || "AutoTestPlatform";
    const stackPrefix = "ATP";

    this.templateOptions.description = `Auto Test Platform. Template version ${VERSION}`;

    const username = new CfnParameter(this, "adminEmail", {
      type: "String",
      description: "The email address of Admin user",
      allowedPattern:
        "\\w[-\\w.+]*@([A-Za-z0-9][-A-Za-z0-9]+\\.)+[A-Za-z]{2,14}",
    });
    this.addToParamLabels("Admin User Email", username.logicalId);
    this.addToParamGroups("Authentication", username.logicalId);

    // Create an Auth Stack (Default Cognito)
    const authStack = new AuthStack(this, `${stackPrefix}Auth`, {
      username: username.valueAsString,
      solutionName: solutionName,
    });
    this.userPoolId = authStack.userPoolId;
    this.userPoolClientId = authStack.userPoolClientId;
    NagSuppressions.addResourceSuppressions(
      authStack,
      [
        {
          id: "AwsSolutions-IAM5",
          reason: "Cognito User Pool need this wildcard permission",
        },
        {
          id: "AwsSolutions-IAM4",
          reason: "these policy is used by CDK Customer Resource lambda",
        },
        {
          id: "AwsSolutions-COG2",
          reason:
            "customer can enable MFA by their own, we do not need to enable it",
        },
      ],
      true
    );

    let vpc = undefined;
    let subnetIds = undefined;

    const vpcStack = new VpcStack(this, `${stackPrefix}Vpc`, {
      vpc: vpc,
    });

    const centralBucket = new s3.Bucket(this, "CentralBucket", {
      removalPolicy: RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });

    const workerProps: WorkerProps = {
      centralBucket: centralBucket,
    };
    const workerStack = new WorkerStack(this, "WorkerStack", workerProps);

    // Create the Appsync API stack
    const apiStack = new APIStack(this, "API", {
      oidcClientId: this.oidcClientId,
      oidcProvider: this.oidcProvider,
      userPoolId: this.userPoolId,
      userPoolClientId: this.userPoolClientId,
      vpc: vpcStack.vpc,
      subnetIds: subnetIds ? subnetIds : vpcStack.subnetIds,
      processSgId: vpcStack.processSg.securityGroupId,
      codeBuildProject: workerStack.codeBuildProject,
      centralBucket: centralBucket,
      authType: this.authType,
      stackPrefix: stackPrefix,
    });
    NagSuppressions.addResourceSuppressions(
      apiStack,
      [
        {
          id: "AwsSolutions-IAM5",
          reason: "Lambda need get dynamic resources",
        },
      ],
      true
    );

    // Create a Portal Stack (Default Cognito)
    const portalStack = new PortalStack(this, "WebConsole", {
      apiEndpoint: apiStack.apiEndpoint,
      customDomainName: this.oidcCustomerDomain,
      iamCertificateId: this.iamCertificateId,
      acmCertificateArn: this.acmCertificateArn,
      authenticationType: this.authType,
    });

    // Perform actions during solution deployment or update
    const crStack = new CustomResourceStack(this, "CR", {
      apiEndpoint: apiStack.apiEndpoint,
      oidcProvider: this.oidcProvider,
      oidcClientId: this.oidcClientId,
      portalBucketName: portalStack.portalBucket.bucketName,
      portalUrl: portalStack.portalUrl,
      cloudFrontDistributionId: portalStack.cloudFrontDistributionId,
      oidcCustomerDomain: this.oidcCustomerDomain,
      userPoolId: this.userPoolId,
      userPoolClientId: this.userPoolClientId,
      authenticationType: this.authType,
    });

    // Allow init config function to put aws-exports.json to portal bucket
    portalStack.portalBucket.grantPut(crStack.initConfigFn);

    this.templateOptions.metadata = {
      "AWS::CloudFormation::Interface": {
        ParameterGroups: this.paramGroups,
        ParameterLabels: this.paramLabels,
      },
    };

    // Output portal Url
    new CfnOutput(this, "WebConsoleUrl", {
      description: "Web Console URL (front-end)",
      value: portalStack.portalUrl,
    }).overrideLogicalId("WebConsoleUrl");

    new CfnOutput(this, "DefaultFlbConfUploadingEventQueueArn", {
      description: "Queue for config file upload events for Fluent Bit",
      value: this.flbConfUploadingEventQueueArn,
    }).overrideLogicalId("DefaultFlbConfUploadingEventQueueArn");
  }

  private addToParamGroups(label: string, ...param: string[]) {
    this.paramGroups.push({
      Label: { default: label },
      Parameters: param,
    });
  }

  private addToParamLabels(label: string, param: string) {
    this.paramLabels[param] = {
      default: label,
    };
  }
}
