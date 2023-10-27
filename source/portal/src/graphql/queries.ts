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
      status
      error
      logLink
      name
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
export const getTestCheckPoint = /* GraphQL */ `query GetTestCheckPoint($id: ID!) {
  getTestCheckPoint(id: $id) {
    id
    createdAt
    status
    error
    logLink
    name
    projectName
    modelName
    __typename
  }
}
` as GeneratedQuery<
  APITypes.GetTestCheckPointQueryVariables,
  APITypes.GetTestCheckPointQuery
>;
