/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/
import React, { useCallback, useState } from "react";
import Breadcrumb from "components/Breadcrumb";
import SideMenu from "components/SideMenu";
import { useTranslation } from "react-i18next";
import Button from "components/Button";
import { ImportTestEnvMutationVariables } from "API";
import { useNavigate } from "react-router-dom";
import HelpPanel from "components/HelpPanel";
import { appSyncRequestMutation } from "assets/js/request";
import HeaderPanel from "components/HeaderPanel";
import FormItem from "components/FormItem";
import TextInput from "components/TextInput";
import { importTestEnv } from "graphql/mutations";
import {
  FieldValidator,
  pipFieldValidator,
  validateRequiredText,
  validateWithRegex
} from "assets/js/utils";
import { handleErrorMessage } from "assets/js/alert";

let validateEnvName: FieldValidator<string>;
let validateAccountId: FieldValidator<string>;

export const validateLinedAccount = (state: ImportTestEnvMutationVariables) =>
  validateEnvName(state.envName) === "" &&
  validateAccountId(state.accountId ?? "") === "";

const LinkAnAccount: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const breadCrumbList = [
    { name: t("name"), link: "/" },
    { name: "Test Environments", link: "/test-env/environments" },
    { name: "Import Test Environments" }
  ];

  const [testEnvInfo, setTestEnvInfo] =
    useState<ImportTestEnvMutationVariables>({
      accountId: "",
      envName: "",
      stackName: "",
      alarmEmail: "",
      projectId: "",
      region: ""
    });

  const [envNameError, setEnvNameError] = useState("");
  const [accountIdError, setAccountIdError] = useState("");
  useState("");

  validateEnvName = useCallback(
    validateRequiredText("Please input Test Environment Name"),
    [i18n.language]
  );

  validateAccountId = useCallback(
    pipFieldValidator(
      validateRequiredText(t("resource:crossAccount.link.inputAccountId")),
      validateWithRegex(/^\d{12}$/)(
        t("resource:crossAccount.link.accountIdFormatError")
      )
    ),
    [i18n.language]
  );

  const [loadingCreate, setLoadingCreate] = useState(false);

  const createTestEnv = async () => {
    const isLinkedAccountValid = validateLinedAccount(testEnvInfo);
    setEnvNameError(validateEnvName(testEnvInfo.envName));
    setAccountIdError(validateAccountId(testEnvInfo.accountId ?? ""));

    if (!isLinkedAccountValid) {
      return false;
    }

    // Trim All Parameter value
    const toTrimObj: { [key: string]: string } = JSON.parse(
      JSON.stringify(testEnvInfo)
    );
    console.info("toTrimObj:", toTrimObj);
    Object.keys(toTrimObj).forEach(
      (key) =>
        (toTrimObj[key] =
          typeof toTrimObj?.[key] === "string"
            ? toTrimObj?.[key].trim().replace(/[\t\r]/g, "")
            : toTrimObj[key])
    );

    try {
      setLoadingCreate(true);
      const createRes = await appSyncRequestMutation(importTestEnv, toTrimObj);
      console.info("createRes:", createRes);
      setLoadingCreate(false);
      navigate("/test-env/environments");
    } catch (error: any) {
      setLoadingCreate(false);
      handleErrorMessage(error.message);
      console.error(error);
    }
  };

  const backToListPage = () => {
    navigate("/test-env/environments");
  };

  return (
    <div className="lh-main-content">
      <SideMenu />
      <div className="lh-container">
        <div className="lh-content">
          <div className="service-log">
            <Breadcrumb list={breadCrumbList} />
            <div className="m-w-800">
              <HeaderPanel title={"Import Test Environment"}>
                <FormItem
                  optionTitle={"Test Environment Name"}
                  optionDesc={"Input a friendly name of the test environment. The name must be unique. (e.g. my-test-1)"}
                  errorText={envNameError}
                >
                  <TextInput
                    value={testEnvInfo.envName || ""}
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                      setTestEnvInfo((prev) => {
                        return {
                          ...prev,
                          envName: event.target.value
                        };
                      });
                      setEnvNameError(validateEnvName(event.target.value));
                    }}
                  />
                </FormItem>
                <FormItem
                  optionTitle={t("resource:crossAccount.link.accountId")}
                  optionDesc={t("resource:crossAccount.link.accountIdDesc")}
                  errorText={accountIdError}
                >
                  <TextInput
                    value={testEnvInfo.accountId || ""}
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                      setTestEnvInfo((prev) => {
                        return {
                          ...prev,
                          accountId: event.target.value
                        };
                      });
                      setAccountIdError(validateAccountId(event.target.value));
                    }}
                  />
                </FormItem>
                <FormItem
                  optionTitle={"Test Environment Region"}
                  optionDesc={"Input the region of the test environment. (e.g. us-west-2)"}
                >
                  <TextInput
                    value={testEnvInfo.region || ""}
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                      setTestEnvInfo((prev) => {
                        return {
                          ...prev,
                          region: event.target.value
                        };
                      });
                    }}
                  />
                </FormItem>
                <FormItem
                  optionTitle={"Project ID"}
                  optionDesc={"Input the project ID of the test environment. Leave it empty for Centralized Logging with OpenSearch."}
                >
                  <TextInput
                    value={testEnvInfo.projectId || ""}
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                      setTestEnvInfo((prev) => {
                        return {
                          ...prev,
                          projectId: event.target.value
                        };
                      });
                    }}
                  />
                </FormItem>
                <FormItem
                  optionTitle={"Alarm Email"}
                  optionDesc={"Input the email address to receive the alarm notification."}
                >
                  <TextInput
                    value={testEnvInfo.alarmEmail || ""}
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                      setTestEnvInfo((prev) => {
                        return {
                          ...prev,
                          alarmEmail: event.target.value
                        };
                      });
                    }}
                  />
                </FormItem>
                <FormItem
                  optionTitle={"Test Env CloudFormation Stack Name"}
                  optionDesc={"Input the CloudFormation stack name of the test environment. (e.g. my-test-1-stack)"}
                >
                  <TextInput
                    value={testEnvInfo.stackName || ""}
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                      setTestEnvInfo((prev) => {
                        return {
                          ...prev,
                          stackName: event.target.value
                        };
                      });
                    }}
                  />
                </FormItem>
              </HeaderPanel>
              
              <div className="button-action text-right">
                <Button
                  disabled={loadingCreate}
                  btnType="text"
                  onClick={() => {
                    backToListPage();
                  }}
                >
                  {t("button.cancel")}
                </Button>
                <Button
                  loading={loadingCreate}
                  btnType="primary"
                  onClick={() => {
                    createTestEnv();
                  }}
                >
                  {t("button.link")}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <HelpPanel />
    </div>
  );
};

export default LinkAnAccount;
