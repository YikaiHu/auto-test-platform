/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

import { Duration, Tags, Aws } from "aws-cdk-lib";
import * as iam from "aws-cdk-lib/aws-iam";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as asg from "aws-cdk-lib/aws-autoscaling";
import { Construct } from "constructs";

export interface Env {
  [key: string]: any;
}

export interface WorkerProps {
  readonly env: Env;
  readonly vpc: ec2.IVpc;
}

/***
 * EC2 Stack
 */
export class WorkerStack extends Construct {
  readonly workerAsg: asg.AutoScalingGroup;

  constructor(scope: Construct, id: string, props: WorkerProps) {
    super(scope, id);

    const instanceType = new ec2.InstanceType("t3.large");

    const ec2SG = new ec2.SecurityGroup(this, "AutoTestEC2SG", {
      vpc: props.vpc,
      description: "Security Group for Auto Test EC2 instances",
      allowAllOutbound: true,
    });
    ec2SG.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(22),
      "Allow ssh access"
    );

    const workerAsgRole = new iam.Role(this, "WorkerAsgRole", {
      assumedBy: new iam.ServicePrincipal("ec2.amazonaws.com"),
    });

    const workerPolicy = new iam.Policy(this, "WorkerPolicy", {
      statements: [
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          resources: ["*"],
          actions: [
            "*",
          ],
        }),
      ],
    });

    workerAsgRole.attachInlinePolicy(workerPolicy);

    this.workerAsg = new asg.AutoScalingGroup(this, "AutoTestWorkerASG", {
      autoScalingGroupName: `${Aws.STACK_NAME}-Worker-ASG`,
      vpc: props.vpc,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PUBLIC,
      },
      instanceType: instanceType,
      machineImage: new ec2.AmazonLinuxImage({
        generation: ec2.AmazonLinuxGeneration.AMAZON_LINUX_2,
      }),
      maxCapacity: 1,
      minCapacity: 1,
      desiredCapacity: 1,
      securityGroup: ec2SG,
      // keyName: 'ad-key',  // dev only
      instanceMonitoring: asg.Monitoring.DETAILED,
      associatePublicIpAddress: true,
      groupMetrics: [
        new asg.GroupMetrics(
          asg.GroupMetric.DESIRED_CAPACITY,
          asg.GroupMetric.IN_SERVICE_INSTANCES
        ),
      ],
      cooldown: Duration.minutes(2),
      role: workerAsgRole,
      blockDevices: [
        {
          deviceName: "/dev/xvda",
          volume: asg.BlockDeviceVolume.ebs(50, {
            encrypted: true,
          }),
        },
      ],
    });

    Tags.of(this.workerAsg).add("Name", `${Aws.STACK_NAME}-Worker`, {});

    this.workerAsg.userData.addCommands(
      "yum update -y",
      "cd /home/ec2-user/",

      // Create the script
      `echo "export AWS_DEFAULT_REGION=${Aws.REGION}" >> env.sh`,
      `echo "export S3_BUCKET_NAME=${props.env.S3_BUCKET_NAME}" >> env.sh`,
      'echo "source /home/ec2-user/env.sh" >> prepare-worker.sh',
      "chmod +x prepare-worker.sh",
      // Run the script
      "./prepare-worker.sh"
    );
  }
}
