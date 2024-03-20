/* eslint-disable react/display-name */
import React, { useEffect, useState } from "react";
import Breadcrumb from "components/Breadcrumb";
import SideMenu from "components/SideMenu";
import { useTranslation } from "react-i18next";
import TriggerDialog from "./TriggerDialog";
import { useParams } from "react-router-dom";
import { formatLocalTime } from "assets/js/utils";
import Status from "components/Status/Status";
import HeaderPanel from "components/HeaderPanel";
import CodeCopy from "components/CodeCopy";
import ValueWithLabel from "components/ValueWithLabel";
import { appSyncRequestQuery } from "assets/js/request";
import { getTestHistory } from "graphql/queries";
import { TestHistory } from "API";
import ExtLink from "components/ExtLink";

const TestDetails: React.FC = () => {
  const { id } = useParams();
  const { t } = useTranslation();
  const [testHistory, setTestHistory] = useState<TestHistory>();

  const breadCrumbList = [
    { name: t("name"), link: "/" },
    { name: "Check Points", link: "/integration-test/checkpoints" },
    {
      name: testHistory?.markerId || "",
      link: "/integration-test/checkpoints/history/" + testHistory?.markerId,
    },
    {
      name: id || "",
    },
  ];

  useEffect(() => {
    asyncGetTestHistory();
  }, [id]);

  const asyncGetTestHistory = async (hideLoading = false) => {
    try {
      if (!hideLoading) {
        setTestHistory(undefined);
      }
      const resData: any = await appSyncRequestQuery(getTestHistory, {
        id: id,
      });
      const testHistory: TestHistory = resData.data.getTestHistory;
      setTestHistory(testHistory);
    } catch (error) {
      console.error(error);
    }
  };

  const generateCodeBuildLink = (testHistory: TestHistory) => {
    if (!testHistory.metaData || !testHistory.codeBuildArn) {
      return "";
    }

    const arnParts = testHistory.codeBuildArn.split(":");
    const buildPart = arnParts.find((part) => part.startsWith("build/"));

    if (!buildPart) {
      return "";
    }

    const projectName = buildPart.split("/")[1];
    const region = testHistory.metaData.region;
    const accountId = testHistory.metaData.accountId;

    const buildIndex = arnParts.findIndex((part) => part.startsWith("build/"));
    const buildDetails = arnParts
      .slice(buildIndex)
      .join(":")
      .substring("build/".length);

    const encodedBuildDetails = encodeURIComponent(buildDetails);

    return `https://${region}.console.aws.amazon.com/codesuite/codebuild/${accountId}/projects/${projectName}/build/${encodedBuildDetails}`;
  };

  const [isTriggerDialogOpen, setIsTriggerDialogOpen] = useState(false);

  const handleTrigger = (selection: any) => {
    console.log("selection:", selection);
    setIsTriggerDialogOpen(false);
  };

  return (
    <div className="lh-main-content">
      <SideMenu />
      <div className="lh-container">
        <div className="lh-content">
          <Breadcrumb list={breadCrumbList} />
          <div className="service-log">
            <HeaderPanel title={"Test configuration"}>
              <div className="flex value-label-span">
                <div className="flex-1">
                  <ValueWithLabel label="AccountID">
                    <div>
                      {testHistory ? (
                        testHistory.metaData?.accountId
                      ) : (
                        <Status status="Loading" />
                      )}
                    </div>
                  </ValueWithLabel>
                  <ValueWithLabel label="Region">
                    <div>
                      {testHistory ? (
                        testHistory.metaData?.region
                      ) : (
                        <Status status="Loading" />
                      )}
                    </div>
                  </ValueWithLabel>
                </div>
                <div className="flex-1">
                  <ValueWithLabel label="Stack Name">
                    <div>
                      {testHistory ? (
                        testHistory.metaData?.stackName
                      ) : (
                        <Status status="Loading" />
                      )}
                    </div>
                  </ValueWithLabel>
                  <ValueWithLabel label="CodeBuild Project">
                    <div>
                      {testHistory &&
                      testHistory.metaData &&
                      testHistory.codeBuildArn ? (
                        <ExtLink to={generateCodeBuildLink(testHistory)}>
                          {"Click to Open Link"}
                        </ExtLink>
                      ) : (
                        <span>{"-"}</span>
                      )}
                    </div>
                  </ValueWithLabel>
                </div>
                <div className="flex-1">
                  <ValueWithLabel label="Created">
                    <div>
                      {testHistory ? (
                        formatLocalTime(testHistory.createdAt || "")
                      ) : (
                        <Status status="Loading" />
                      )}
                    </div>
                  </ValueWithLabel>
                  <ValueWithLabel label="Duration">
                    <div>
                      {testHistory ? (
                        testHistory.duration
                      ) : (
                        <Status status="Loading" />
                      )}
                    </div>
                  </ValueWithLabel>
                </div>
                <div className="flex-1">
                  <ValueWithLabel label="Status">
                    <div>
                      {testHistory ? (
                        <Status status={testHistory.status || "-"} />
                      ) : (
                        <Status status="Loading" />
                      )}
                    </div>
                  </ValueWithLabel>
                </div>
              </div>
              <div className="flex value-label-span">
                <div className="flex-1">
                  <ValueWithLabel label="Parameters">
                    <div>
                      {testHistory?.parameters &&
                      testHistory.parameters.length > 0 ? (
                        testHistory.parameters
                          .map((param) =>
                            param
                              ? `${param.parameterKey}: ${param.parameterValue}`
                              : ""
                          )
                          .join(", ")
                      ) : (
                        <Status status="Loading" />
                      )}
                    </div>
                  </ValueWithLabel>
                </div>
              </div>
            </HeaderPanel>

            <div>
              <HeaderPanel title={"Test Details"}>
                <div>
                  {testHistory?.result?.map(
                    (resultItem, index) =>
                      resultItem && (
                        <React.Fragment key={index}>
                          <div>
                            <h6>Test Trace {index + 1}</h6>
                            <CodeCopy
                              loading={false}
                              code={resultItem.trace || ""}
                            />
                          </div>
                          <div>
                            <h6>Test Log {index + 1}</h6>
                            <CodeCopy
                              loading={false}
                              code={resultItem.message || ""}
                            />
                          </div>
                        </React.Fragment>
                      )
                  )}
                </div>
              </HeaderPanel>
            </div>
          </div>
        </div>
      </div>
      <TriggerDialog
        isOpen={isTriggerDialogOpen}
        onClose={() => setIsTriggerDialogOpen(false)}
        onTrigger={handleTrigger}
        parameters={[]}
      />
    </div>
  );
};

export default TestDetails;
