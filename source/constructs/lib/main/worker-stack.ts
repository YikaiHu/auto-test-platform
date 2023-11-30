import { Aws, aws_s3 as s3, aws_codebuild as codebuild } from "aws-cdk-lib";
import { Construct } from "constructs";

export interface WorkerProps {
  readonly centralBucket: s3.Bucket;
}

export class WorkerStack extends Construct {
  readonly codeBuildProject: codebuild.PipelineProject;

  constructor(scope: Construct, id: string, props: WorkerProps) {
    super(scope, id);

    const environmentVariables: {
      [key: string]: codebuild.BuildEnvironmentVariable;
    } = {
      MY_ENV_VAR_1: {
        type: codebuild.BuildEnvironmentVariableType.PLAINTEXT,
        value: "value1",
      },
      MY_ENV_VAR_2: {
        type: codebuild.BuildEnvironmentVariableType.PLAINTEXT,
        value: "value2",
      },
    };

    this.codeBuildProject = new codebuild.PipelineProject(
      this,
      "ATPCodeBuild",
      {
        projectName: `${Aws.STACK_NAME}-ATP-CodeBuild`,
        environment: {
          buildImage: codebuild.LinuxBuildImage.STANDARD_5_0,
          environmentVariables: environmentVariables,
        },
        buildSpec: codebuild.BuildSpec.fromObject({
          version: "0.2",
          phases: {
            build: {
              commands: [
                'echo "Hello, CodeBuild!"', // Your build commands go here
              ],
            },
          },
          post_build: {
            commands: [
              `aws s3 sync testResult/ s3://${props.centralBucket.bucketName}/yourPrefix`, // Upload files from 'testResult' to S3
            ],
          },
        }),
      }
    );
    props.centralBucket.grantReadWrite(this.codeBuildProject);
  }
}
