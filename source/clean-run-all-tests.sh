#!/bin/bash
#
# This script runs all tests for the root CDK project, as well as any microservices, Lambda functions, or dependency 
# source code packages. These include unit tests, integration tests, and snapshot tests.
# 
# This script is called by the ../initialize-repo.sh file and the buildspec.yml file. It is important that this script 
# be tested and validated to ensure that all available test fixtures are run.
#
# The if/then blocks are for error handling. They will cause the script to stop executing if an error is thrown from the
# node process running the test case(s). Removing them or not using them for additional calls with result in the 
# script continuing to execute despite an error being thrown.

[ "$DEBUG" == 'true' ] && set -x
set -e

remove_python_test() {
	local component_path=$1
	local component_name=$2

	cd $component_path

	if [ "${CLEAN:-true}" = "true" ]; then
		rm -fr .venv-test
		rm -f .coverage
		rm -fr .pytest_cache
		rm -fr __pycache__ test/__pycache__
	fi

	echo "Remove test env for $component_name"
}

# Save the current working directory
source_dir=$PWD
echo $source_dir

# Test the CDK project
construct_dir=$source_dir/constructs
# run_cdk_project_test $construct_dir

# Test the attached Lambda function
remove_python_test $construct_dir/lambda/common-lib common-lib
remove_python_test $construct_dir/lambda/pipeline/service/log-processor svc-log-processor
remove_python_test $construct_dir/lambda/pipeline/app/log-processor app-log-processor
remove_python_test $construct_dir/lambda/pipeline/common/opensearch-helper opensearch-helper
remove_python_test $construct_dir/lambda/plugin/standard plugin
remove_python_test $construct_dir/lambda/api/resource resource-api
remove_python_test $construct_dir/lambda/api/pipeline svc-pipeline-api
remove_python_test $construct_dir/lambda/api/log_agent_status log_agent_status
remove_python_test $construct_dir/lambda/main/cfnHelper cfnHelper
remove_python_test $construct_dir/lambda/main/sfnHelper sfnHelper
remove_python_test $construct_dir/lambda/custom-resource custom-resource
remove_python_test $construct_dir/lambda/api/app_log_ingestion app_log_ingestion
remove_python_test $construct_dir/lambda/api/log_source log_source
remove_python_test $construct_dir/lambda/api/log_conf log_conf
remove_python_test $construct_dir/lambda/api/app_pipeline app_pipeline
remove_python_test $construct_dir/lambda/api/cross_account cross_account
remove_python_test $construct_dir/lambda/api/cluster aos_cluster
remove_python_test $construct_dir/lambda/pipeline/common/custom-resource custom-resource2
remove_python_test $construct_dir/lambda/api/pipeline_ingestion_flow pipeline_ingestion_flow
remove_python_test $construct_dir/lambda/api/cwl cloudwatch_api
remove_python_test $construct_dir/lambda/api/alarm alarm_api
remove_python_test $construct_dir/ecr/s3-list-objects s3-list-objects
remove_python_test $construct_dir/lambda/api/grafana grafana
# Return to the source/ level
cd $source_dir