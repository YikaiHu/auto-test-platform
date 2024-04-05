import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { appSyncRequestQuery } from "assets/js/request";
import LoadingText from "components/LoadingText";
import { TestEnv } from "API";
import SideMenu from "components/SideMenu";
import Breadcrumb from "components/Breadcrumb";
import PagePanel from "components/PagePanel";
import HeaderPanel from "components/HeaderPanel";
import FormItem from "components/FormItem";
import TextInput from "components/TextInput";
import { handleErrorMessage } from "assets/js/alert";
import { getTestEnv } from "graphql/queries";

const CrossAccountDetail: React.FC = () => {
  const { id } = useParams();
  const [curTestEnv, setCurTestEnv] = useState<TestEnv>();
  const [loadingData, setLoadingData] = useState(true);
  const breadCrumbList = [
    { name: "Home", link: "/" },
    { name: "Test Environments", link: "/test-env/environments" },
    {
      name: curTestEnv?.envName || ""
    }
  ];

  const getAccountDetail = async () => {
    setLoadingData(true);
    try {
      const resData: any = await appSyncRequestQuery(getTestEnv, {
        id: decodeURIComponent(id || "")
      });
      const testEnv: TestEnv = resData.data.getTestEnv;
      setCurTestEnv(testEnv);
      setLoadingData(false);
    } catch (error: any) {
      setLoadingData(false);
      handleErrorMessage(error.message);
      console.error(error);
    }
  };

  useEffect(() => {
    getAccountDetail();
  }, []);

  return (
    <div>
      <div className="lh-main-content">
        <SideMenu />
        <div className="lh-container">
          <div className="lh-content">
            <Breadcrumb list={breadCrumbList} />
            {loadingData ? (
              <LoadingText />
            ) : (
              <div className="m-w-800">
                <PagePanel title={curTestEnv?.envName || ""}>
                  <HeaderPanel title="Cross Account Details">
                    <FormItem optionTitle="Environment Name" optionDesc="">
                      <TextInput
                        readonly
                        value={curTestEnv?.envName || ""}
                        onChange={(event) => {
                          console.info(event);
                        }}
                      />
                    </FormItem>
                    <FormItem optionTitle="Region" optionDesc="">
                      <TextInput
                        readonly
                        value={curTestEnv?.region || ""}
                        onChange={(event) => {
                          console.info(event);
                        }}
                      />
                    </FormItem>
                    <FormItem optionTitle="Stack Name" optionDesc="">
                      <TextInput
                        readonly
                        value={curTestEnv?.stackName || ""}
                        onChange={(event) => {
                          console.info(event);
                        }}
                      />
                    </FormItem>
                    <FormItem optionTitle="Account ID" optionDesc="">
                      <TextInput
                        readonly
                        value={curTestEnv?.accountId || ""}
                        onChange={(event) => {
                          console.info(event);
                        }}
                      />
                    </FormItem>
                    <FormItem optionTitle="Alarm Email" optionDesc="">
                      <TextInput
                        readonly
                        value={curTestEnv?.alarmEmail || ""}
                        onChange={(event) => {
                          console.info(event);
                        }}
                      />
                    </FormItem>
                    <FormItem optionTitle="Project ID" optionDesc="">
                      <TextInput
                        readonly
                        value={curTestEnv?.projectId || ""}
                        onChange={(event) => {
                          console.info(event);
                        }}
                      />
                    </FormItem>
                  </HeaderPanel>
                </PagePanel>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CrossAccountDetail;
