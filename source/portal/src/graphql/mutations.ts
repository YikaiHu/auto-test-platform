/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

import * as APITypes from "../API";
type GeneratedMutation<InputType, OutputType> = string & {
  __generatedMutationInput: InputType;
  __generatedMutationOutput: OutputType;
};

export const startSingleTest = /* GraphQL */ `mutation StartSingleTest($markerId: String!, $parameters: [ParameterInput]) {
  startSingleTest(markerId: $markerId, parameters: $parameters)
}
` as GeneratedMutation<
  APITypes.StartSingleTestMutationVariables,
  APITypes.StartSingleTestMutation
>;
export const importTestEnv = /* GraphQL */ `mutation ImportTestEnv(
  $envName: String!
  $region: String!
  $stackName: String!
  $accountId: String
  $alarmEmail: String!
  $projectId: String
) {
  importTestEnv(
    envName: $envName
    region: $region
    stackName: $stackName
    accountId: $accountId
    alarmEmail: $alarmEmail
    projectId: $projectId
  )
}
` as GeneratedMutation<
  APITypes.ImportTestEnvMutationVariables,
  APITypes.ImportTestEnvMutation
>;
export const deleteTestEnv = /* GraphQL */ `mutation DeleteTestEnv($id: ID!) {
  deleteTestEnv(id: $id)
}
` as GeneratedMutation<
  APITypes.DeleteTestEnvMutationVariables,
  APITypes.DeleteTestEnvMutation
>;
