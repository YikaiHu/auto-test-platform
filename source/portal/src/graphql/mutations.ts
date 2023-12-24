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
