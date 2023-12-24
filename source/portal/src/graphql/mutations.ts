/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

import * as APITypes from "../API";
type GeneratedMutation<InputType, OutputType> = string & {
  __generatedMutationInput: InputType;
  __generatedMutationOutput: OutputType;
};

export const startSingleTest = /* GraphQL */ `mutation StartSingleTest(
  $projectName: String!
  $marker: String!
  $parameters: [ParameterInput]
) {
  startSingleTest(
    projectName: $projectName
    marker: $marker
    parameters: $parameters
  )
}
` as GeneratedMutation<
  APITypes.StartSingleTestMutationVariables,
  APITypes.StartSingleTestMutation
>;
