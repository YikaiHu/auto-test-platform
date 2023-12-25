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
            install: {
              commands: [
              'echo "git clone"',
              'git clone --depth=1 --branch=${branch} ${code_commit_repo}',
              'export DIR=$PWD',
              'last_segment=$(echo "$code_commit_repo" | awk -F "/" "{print $NF}")',
              'echo "$last_segment"',
              'export TESTDIR=$DIR/"$last_segment"',
              'echo $TESTDIR',
              'cd $TESTDIR',
              'echo "pip install"',
              'echo $(python3 --version)',
              'echo $(pip3 --version)',
              'pip3 install -r requirements.txt'
              ]
            },

            build: {
              commands: [
                'echo "start tests"', // Your build commands go here
                'sh start_test_autotest_platform.sh "$mark" "$parameter" "$region"'
              ],
            },
          },
          post_build: {
            commands: [
              'current_time=$(date +"%H-%M-%S")',
              'RESULTS_FILE_NAME="${project_name}-${mark}-${current_time}.json"',
              `aws s3 cp test-report.json s3://${props.centralBucket.bucketName}/$project_name/$mark/$RESULTS_FILE_NAME`, // Upload files from 'testResult' to S3
            ],
          },
        }),
      }
    );
    props.centralBucket.grantReadWrite(this.codeBuildProject);
  }
}
