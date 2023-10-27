/* tslint:disable */
/* eslint-disable */
//  This file was automatically generated and should not be edited.

export type ListCheckPointResponse = {
  __typename: "ListCheckPointResponse",
  checkPoints?:  Array<CheckPoint | null > | null,
  total?: number | null,
};

export type CheckPoint = {
  __typename: "CheckPoint",
  id: string,
  createdAt?: string | null,
  status?: CheckPointStatus | null,
  error?: string | null,
  logLink?: string | null,
  name?: string | null,
  projectName?: string | null,
  modelName?: string | null,
};

export enum CheckPointStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  CREATING = "CREATING",
  DELETING = "DELETING",
  ERROR = "ERROR",
}


export type ListTestCheckPointsQueryVariables = {
  page?: number | null,
  count?: number | null,
};

export type ListTestCheckPointsQuery = {
  listTestCheckPoints?:  {
    __typename: "ListCheckPointResponse",
    checkPoints?:  Array< {
      __typename: "CheckPoint",
      id: string,
      createdAt?: string | null,
      status?: CheckPointStatus | null,
      error?: string | null,
      logLink?: string | null,
      name?: string | null,
      projectName?: string | null,
      modelName?: string | null,
    } | null > | null,
    total?: number | null,
  } | null,
};

export type GetTestCheckPointQueryVariables = {
  id: string,
};

export type GetTestCheckPointQuery = {
  getTestCheckPoint?:  {
    __typename: "CheckPoint",
    id: string,
    createdAt?: string | null,
    status?: CheckPointStatus | null,
    error?: string | null,
    logLink?: string | null,
    name?: string | null,
    projectName?: string | null,
    modelName?: string | null,
  } | null,
};
