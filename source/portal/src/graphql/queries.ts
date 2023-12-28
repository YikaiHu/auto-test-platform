/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

import * as APITypes from "../API";
type GeneratedQuery<InputType, OutputType> = string & {
  __generatedQueryInput: InputType;
  __generatedQueryOutput: OutputType;
};

export const listTestCheckPoints = /* GraphQL */ `query ListTestCheckPoints($page: Int, $count: Int) {
  listTestCheckPoints(page: $page, count: $count) {
    checkPoints {
      id
      createdAt
      lastTestedAt
      status
      projectName
      modelName
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
export const listTestHistory = /* GraphQL */ `query ListTestHistory($id: ID!, $page: Int, $count: Int) {
  listTestHistory(id: $id, page: $page, count: $count) {
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
