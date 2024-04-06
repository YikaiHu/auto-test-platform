/* tslint:disable */
/* eslint-disable */
//  This file was automatically generated and should not be edited.

export type ParameterInput = {
  parameterKey?: string | null,
  parameterValue?: string | null,
};

export type ListCheckPointResponse = {
  __typename: "ListCheckPointResponse",
  checkPoints?:  Array<CheckPoint | null > | null,
  total?: number | null,
};

export type CheckPoint = {
  __typename: "CheckPoint",
  id: string,
  createdAt?: string | null,
  lastTestedAt?: string | null,
  status?: CheckPointStatus | null,
  projectName?: string | null,
  modelName?: string | null,
  parameters?:  Array<AllowedParameters | null > | null,
};

export enum CheckPointStatus {
  PASS = "PASS",
  RUNNING = "RUNNING",
  FAILED = "FAILED",
  ERROR = "ERROR",
  UNKNOWN = "UNKNOWN",
}


export type AllowedParameters = {
  __typename: "AllowedParameters",
  parameterKey?: string | null,
  allowedValues?: Array< string | null > | null,
};

export type ListTestHistoryResponse = {
  __typename: "ListTestHistoryResponse",
  testHistories?:  Array<TestHistory | null > | null,
  total?: number | null,
};

export type TestHistory = {
  __typename: "TestHistory",
  id: string,
  markerId?: string | null,
  createdAt?: string | null,
  duration?: string | null,
  status?: CheckPointStatus | null,
  parameters?:  Array<Parameters | null > | null,
  result?:  Array<TestResult | null > | null,
  codeBuildArn?: string | null,
  metaData?: MetaData | null,
};

export type Parameters = {
  __typename: "Parameters",
  parameterKey?: string | null,
  parameterValue?: string | null,
};

export type TestResult = {
  __typename: "TestResult",
  trace?: string | null,
  message?: string | null,
};

export type MetaData = {
  __typename: "MetaData",
  accountId?: string | null,
  region?: string | null,
  stackName?: string | null,
};

export type ListTestEnvResponse = {
  __typename: "ListTestEnvResponse",
  testEnvs?:  Array<TestEnv | null > | null,
  total?: number | null,
};

export type TestEnv = {
  __typename: "TestEnv",
  id: string,
  envName?: string | null,
  region?: string | null,
  stackName?: string | null,
  accountId?: string | null,
  alarmEmail?: string | null,
  projectId?: string | null,
};

export type StartSingleTestMutationVariables = {
  markerId: string,
  parameters?: Array< ParameterInput | null > | null,
};

export type StartSingleTestMutation = {
  startSingleTest?: string | null,
};

export type ImportTestEnvMutationVariables = {
  envName: string,
  region: string,
  stackName: string,
  accountId?: string | null,
  alarmEmail: string,
  projectId?: string | null,
};

export type ImportTestEnvMutation = {
  importTestEnv?: string | null,
};

export type DeleteTestEnvMutationVariables = {
  id: string,
};

export type DeleteTestEnvMutation = {
  deleteTestEnv?: string | null,
};

export type ListTestCheckPointsQueryVariables = {
  page?: number | null,
  count?: number | null,
  testEnvId?: string | null,
};

export type ListTestCheckPointsQuery = {
  listTestCheckPoints?:  {
    __typename: "ListCheckPointResponse",
    checkPoints?:  Array< {
      __typename: "CheckPoint",
      id: string,
      createdAt?: string | null,
      lastTestedAt?: string | null,
      status?: CheckPointStatus | null,
      projectName?: string | null,
      modelName?: string | null,
      parameters?:  Array< {
        __typename: "AllowedParameters",
        parameterKey?: string | null,
        allowedValues?: Array< string | null > | null,
      } | null > | null,
    } | null > | null,
    total?: number | null,
  } | null,
};

export type ListTestHistoryQueryVariables = {
  id: string,
  page?: number | null,
  count?: number | null,
  testEnvId?: string | null,
};

export type ListTestHistoryQuery = {
  listTestHistory?:  {
    __typename: "ListTestHistoryResponse",
    testHistories?:  Array< {
      __typename: "TestHistory",
      id: string,
      markerId?: string | null,
      createdAt?: string | null,
      duration?: string | null,
      status?: CheckPointStatus | null,
      parameters?:  Array< {
        __typename: "Parameters",
        parameterKey?: string | null,
        parameterValue?: string | null,
      } | null > | null,
      result?:  Array< {
        __typename: "TestResult",
        trace?: string | null,
        message?: string | null,
      } | null > | null,
      codeBuildArn?: string | null,
      metaData?:  {
        __typename: "MetaData",
        accountId?: string | null,
        region?: string | null,
        stackName?: string | null,
      } | null,
    } | null > | null,
    total?: number | null,
  } | null,
};

export type GetTestHistoryQueryVariables = {
  id: string,
};

export type GetTestHistoryQuery = {
  getTestHistory?:  {
    __typename: "TestHistory",
    id: string,
    markerId?: string | null,
    createdAt?: string | null,
    duration?: string | null,
    status?: CheckPointStatus | null,
    parameters?:  Array< {
      __typename: "Parameters",
      parameterKey?: string | null,
      parameterValue?: string | null,
    } | null > | null,
    result?:  Array< {
      __typename: "TestResult",
      trace?: string | null,
      message?: string | null,
    } | null > | null,
    codeBuildArn?: string | null,
    metaData?:  {
      __typename: "MetaData",
      accountId?: string | null,
      region?: string | null,
      stackName?: string | null,
    } | null,
  } | null,
};

export type ListTestEnvsQueryVariables = {
  page?: number | null,
  count?: number | null,
};

export type ListTestEnvsQuery = {
  listTestEnvs?:  {
    __typename: "ListTestEnvResponse",
    testEnvs?:  Array< {
      __typename: "TestEnv",
      id: string,
      envName?: string | null,
      region?: string | null,
      stackName?: string | null,
      accountId?: string | null,
      alarmEmail?: string | null,
      projectId?: string | null,
    } | null > | null,
    total?: number | null,
  } | null,
};

export type GetTestEnvQueryVariables = {
  id: string,
};

export type GetTestEnvQuery = {
  getTestEnv?:  {
    __typename: "TestEnv",
    id: string,
    envName?: string | null,
    region?: string | null,
    stackName?: string | null,
    accountId?: string | null,
    alarmEmail?: string | null,
    projectId?: string | null,
  } | null,
};
