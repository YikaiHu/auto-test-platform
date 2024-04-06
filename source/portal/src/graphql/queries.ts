/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

import * as APITypes from "../API";
type GeneratedQuery<InputType, OutputType> = string & {
  __generatedQueryInput: InputType;
  __generatedQueryOutput: OutputType;
};

export const listTestCheckPoints = /* GraphQL */ `query ListTestCheckPoints($page: Int, $count: Int, $testEnvId: ID) {
  listTestCheckPoints(page: $page, count: $count, testEnvId: $testEnvId) {
    checkPoints {
      id
      createdAt
      lastTestedAt
      status
      projectName
      modelName
      parameters {
        parameterKey
        allowedValues
        __typename
      }
      __typename
    }
    total
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListTestCheckPointsQueryVariables,
  APITypes.ListTestCheckPointsQuery
>;
export const listTestHistory = /* GraphQL */ `query ListTestHistory($id: ID!, $page: Int, $count: Int, $testEnvId: ID) {
  listTestHistory(id: $id, page: $page, count: $count, testEnvId: $testEnvId) {
    testHistories {
      id
      markerId
      createdAt
      duration
      status
      parameters {
        parameterKey
        parameterValue
        __typename
      }
      result {
        trace
        message
        __typename
      }
      codeBuildArn
      metaData {
        accountId
        region
        stackName
        __typename
      }
      __typename
    }
    total
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListTestHistoryQueryVariables,
  APITypes.ListTestHistoryQuery
>;
export const getTestHistory = /* GraphQL */ `query GetTestHistory($id: ID!) {
  getTestHistory(id: $id) {
    id
    markerId
    createdAt
    duration
    status
    parameters {
      parameterKey
      parameterValue
      __typename
    }
    result {
      trace
      message
      __typename
    }
    codeBuildArn
    metaData {
      accountId
      region
      stackName
      __typename
    }
    __typename
  }
}
` as GeneratedQuery<
  APITypes.GetTestHistoryQueryVariables,
  APITypes.GetTestHistoryQuery
>;
export const listTestEnvs = /* GraphQL */ `query ListTestEnvs($page: Int, $count: Int) {
  listTestEnvs(page: $page, count: $count) {
    testEnvs {
      id
      envName
      region
      stackName
      accountId
      alarmEmail
      projectId
      __typename
    }
    total
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListTestEnvsQueryVariables,
  APITypes.ListTestEnvsQuery
>;
export const getTestEnv = /* GraphQL */ `query GetTestEnv($id: ID!) {
  getTestEnv(id: $id) {
    id
    envName
    region
    stackName
    accountId
    alarmEmail
    projectId
    __typename
  }
}
` as GeneratedQuery<
  APITypes.GetTestEnvQueryVariables,
  APITypes.GetTestEnvQuery
>;
