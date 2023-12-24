/* eslint-disable react/display-name */
import React, { useState } from "react";
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


const TestDetails: React.FC = () => {
  const { id } = useParams();
  const { t } = useTranslation();
  const breadCrumbList = [
    { name: t("name"), link: "/" },
    { name: "Check Points", link: "/integration-test/checkpoints" },
    {
      name: id || "",
    },
  ];

  const traceMessage = `
  api_client = <API.apis.ApiFactory object at 0x10b07fdf0>\n\n @pytest.mark.test\n def test_tmp(api_client):\n re = api_client.ping_services(‘sa-east-1’, ‘emr-serverless,msk,quicksight,redshift-serverless,global-accelerator’)\n tmp = [each[‘available’] for each in re[‘data’]]\n print(tmp)\n> assert False in tmp\nE assert False in [True, True, True, True, True]\n\ncases/test_data_ingestion.py:196: AssertionError
`

  const logMessage = `assert False in [True, True, True, True, True]`;

  const [isTriggerDialogOpen, setIsTriggerDialogOpen] = useState(false);

  const handleTrigger = (buffer: string, logType: string) => {
    console.log("Buffer:", buffer, "Log Type:", logType);
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
                    <div>{"691546483958"}</div>
                  </ValueWithLabel>
                  <ValueWithLabel label="Region">
                    <div>{"ap-northeast-1"}</div>
                  </ValueWithLabel>
                </div>
                <div className="flex-1">
                  <ValueWithLabel label="Stack Name">
                    <div>{"clo-auto-test"}</div>
                  </ValueWithLabel>
                </div>
                <div className="flex-1">
                  <ValueWithLabel label="Created">
                    <div>{formatLocalTime("")}</div>
                  </ValueWithLabel>
                  <ValueWithLabel label="Duration">
                    <div>{"xxxxx"}</div>
                  </ValueWithLabel>
                </div>
                <div className="flex-1">
                  <ValueWithLabel label="Status">
                    <div>{<Status status={'Active' || "-"} />}</div>
                  </ValueWithLabel>
                </div>
              </div>
              <div className="flex value-label-span">
                <div className="flex-1">
                  <ValueWithLabel label="Parameters">
                    <div>{"这里展示Parameters的值xxxcascascascasascascasascasascasascascasscascaascascascascacascascascascascasacs"}</div>
                  </ValueWithLabel>
                </div>
              </div>
            </HeaderPanel>
            <div>
              <HeaderPanel title={"Test Details"}>
                <div>
                  <div>
                    <h6>Test Trace</h6>
                    <CodeCopy loading={false} code={traceMessage} />
                  </div>
                  <div>
                    <h6>Test Log</h6>
                    <CodeCopy loading={false} code={logMessage} />
                  </div>
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
      />
    </div>
  );
};

export default TestDetails;
