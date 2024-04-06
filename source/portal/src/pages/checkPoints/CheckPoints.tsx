/* eslint-disable react/display-name */
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Pagination from "@material-ui/lab/Pagination";
import Button from "components/Button";
import { TablePanel } from "components/TablePanel";
import Breadcrumb from "components/Breadcrumb";
import { SelectType } from "components/TablePanel/tablePanel";
import { appSyncRequestQuery } from "assets/js/request";
import { listTestCheckPoints, listTestEnvs } from "graphql/queries";
import { AUTO_REFRESH_INT } from "assets/js/const";
import HelpPanel from "components/HelpPanel";
import SideMenu from "components/SideMenu";
import { useTranslation } from "react-i18next";
import PipelineStatusComp from "./common/PipelineStatus";
import ButtonRefresh from "components/ButtonRefresh";
import { CheckPoint, CheckPointStatus, TestEnv } from "API";
import TriggerDialog from "./TriggerDialog";
import { startSingleTest } from "graphql/mutations";
import { handleErrorMessage } from "assets/js/alert";
import ATPSelect from "../testEnvs/Select";

const PAGE_SIZE = 10;

const CheckPoints: React.FC = () => {
  const { t } = useTranslation();
  const breadCrumbList = [
    { name: t("name"), link: "/" },
    { name: "Check Points" }
  ];

  const navigate = useNavigate();
  const [loadingData, setLoadingData] = useState(false);
  const [checkPointsList, setCheckPointsList] = useState<CheckPoint[]>([]);
  const [selectedCheckPoints, setSelectedCheckPoints] = useState<any[]>([]);
  const [disabledDetail, setDisabledDetail] = useState(false);
  const [totoalCount, setTotoalCount] = useState(0);
  const [curPage, setCurPage] = useState(1);

  const [envList, setEnvList] = useState<TestEnv[]>([]);
  const [selectedEnvId, setSelectedEnvId] = useState<string>("");

  const fetchEnvList = async () => {
    try {
      const resData: any = await appSyncRequestQuery(listTestEnvs, {
        page: 1,
        count: 100
      });
      const dataTestEnvList: TestEnv[] = [
        { id: "", envName: "ALL" },
        ...(resData.data.listTestEnvs?.testEnvs || [])
      ];
      setEnvList(dataTestEnvList);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchEnvList();
  }, []);

  const handleEnvChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedEnvId(event.target.value);
  };

  const [isTriggerDialogOpen, setIsTriggerDialogOpen] = useState(false);

  const handleTrigger = async (selections: []) => {
    console.log("Inputs:", selections);
    try {
      const parameters = Object.entries(selections).map(([key, value]) => ({
        parameterKey: key,
        parameterValue: value
      }));

      const resData: any = await appSyncRequestQuery(startSingleTest, {
        markerId: selectedCheckPoints[0].id,
        parameters: parameters
      });
      console.info("resData:", resData);
      navigate(
        `/integration-test/checkpoints/history/detail/${resData.data.startSingleTest}`
      );
    } catch (error: any) {
      handleErrorMessage(error.message);
      console.error(error);
    } finally {
      setIsTriggerDialogOpen(false);
    }
  };

  // Get Service Log List
  const getCheckPointsList = async (hideLoading = false) => {
    try {
      if (!hideLoading) {
        setCheckPointsList([]);
        setSelectedCheckPoints([]);
        setLoadingData(true);
      }
      const resData: any = await appSyncRequestQuery(listTestCheckPoints, {
        page: curPage,
        count: PAGE_SIZE,
        testEnvId: selectedEnvId
      });
      const checkPointsList: CheckPoint[] =
        resData.data.listTestCheckPoints.checkPoints;
      setTotoalCount(resData.data.listTestCheckPoints.total);
      setCheckPointsList(checkPointsList);
      setLoadingData(false);
    } catch (error) {
      console.error(error);
    }
  };

  const handlePageChange = (event: any, value: number) => {
    setCurPage(value);
  };

  // Click View Detail Button Redirect to detail page
  const clickToReviewDetail = () => {
    navigate(
      `/integration-test/checkpoints/history/${selectedCheckPoints[0]?.id}`
    );
  };

  useEffect(() => {
    getCheckPointsList();
  }, [curPage]);

  useEffect(() => {
    getCheckPointsList();
  }, [selectedEnvId]);

  useEffect(() => {
    console.info("selectedCheckPoints:", selectedCheckPoints);
    if (selectedCheckPoints.length === 1) {
      setDisabledDetail(false);
    } else {
      setDisabledDetail(true);
    }
    if (selectedCheckPoints.length > 0) {
      if (
        selectedCheckPoints[0].status === CheckPointStatus.PASS ||
        selectedCheckPoints[0].status === CheckPointStatus.ERROR
      ) {
        // setDisabledDelete(false);
      } else {
        // setDisabledDelete(true);
      }
    } else {
      // setDisabledDelete(true);
    }
  }, [selectedCheckPoints]);

  // Auto Refresh List
  useEffect(() => {
    const refreshInterval = setInterval(() => {
      getCheckPointsList(true);
    }, AUTO_REFRESH_INT);
    console.info("refreshInterval:", refreshInterval);
    return () => clearInterval(refreshInterval);
  }, [curPage, selectedEnvId]);

  const renderCheckPointId = (data: CheckPoint) => {
    return (
      <Link to={`/integration-test/checkpoints/history/${data.id}`}>
        {data.id}
      </Link>
    );
  };

  const renderStatus = (data: CheckPoint) => {
    return (
      <PipelineStatusComp
        status={data.status}
        stackId={data.id}
        error={data.status}
      />
    );
  };

  return (
    <div className="lh-main-content">
      <SideMenu />
      <div className="lh-container">
        <div className="lh-content">
          <div className="service-log">
            <Breadcrumb list={breadCrumbList} />
            <div className="table-data">
              <TablePanel
                trackId="id"
                defaultSelectItem={selectedCheckPoints}
                title={"Integration Test Checkpoints"}
                changeSelected={(item) => {
                  setSelectedCheckPoints(item);
                }}
                loading={loadingData}
                selectType={SelectType.RADIO}
                columnDefinitions={[
                  {
                    id: "id",
                    header: "ID",
                    width: 200,
                    cell: (e: CheckPoint) => renderCheckPointId(e)
                  },
                  {
                    width: 150,
                    id: "projectName",
                    header: "Project Name",
                    cell: (e: CheckPoint) => {
                      return e.projectName;
                    }
                  },
                  {
                    width: 150,
                    id: "modelName",
                    header: "Model Name",
                    cell: (e: CheckPoint) => {
                      return e.modelName;
                    }
                  },
                  {
                    width: 150,
                    id: "status",
                    header: "Latest Test Status",
                    cell: (e: CheckPoint) => renderStatus(e)
                  }
                ]}
                items={checkPointsList}
                actions={
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "flex-end",
                      gap: "8px"
                    }}
                  >
                    <Button
                      btnType="icon"
                      disabled={loadingData}
                      onClick={() => {
                        if (curPage === 1) {
                          getCheckPointsList();
                          fetchEnvList();
                        } else {
                          setCurPage(1);
                        }
                      }}
                    >
                      <ButtonRefresh loading={loadingData} />
                    </Button>
                    <ATPSelect
                      value={selectedEnvId}
                      onChange={handleEnvChange}
                      optionList={envList.map((env) => ({
                        name: `Test Env: ${env.envName || ""}`,
                        value: env.id
                      }))}
                      allowEmpty={true}
                      width={140}
                    />
                    <Button
                      disabled={disabledDetail}
                      onClick={() => {
                        clickToReviewDetail();
                      }}
                    >
                      {t("button.viewDetail")}
                    </Button>
                    <Button
                      disabled={disabledDetail}
                      btnType="primary"
                      onClick={() => setIsTriggerDialogOpen(true)}
                    >
                      {t("button.trigger")}
                    </Button>
                  </div>
                }
                pagination={
                  <Pagination
                    count={Math.ceil(totoalCount / PAGE_SIZE)}
                    page={curPage}
                    onChange={handlePageChange}
                    size="small"
                  />
                }
              />
            </div>
          </div>
        </div>
      </div>
      <HelpPanel />
      <TriggerDialog
        isOpen={isTriggerDialogOpen}
        onClose={() => setIsTriggerDialogOpen(false)}
        onTrigger={handleTrigger}
        parameters={selectedCheckPoints[0]?.parameters || []}
      />
    </div>
  );
};

export default CheckPoints;
