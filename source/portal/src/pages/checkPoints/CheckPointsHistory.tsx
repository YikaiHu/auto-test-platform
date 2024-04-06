import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Pagination from "@material-ui/lab/Pagination";
import Button from "components/Button";
import { TablePanel } from "components/TablePanel";
import Breadcrumb from "components/Breadcrumb";
import { SelectType } from "components/TablePanel/tablePanel";
import { appSyncRequestQuery } from "assets/js/request";
import { listTestEnvs, listTestHistory } from "graphql/queries";
import { AUTO_REFRESH_INT } from "assets/js/const";
import HelpPanel from "components/HelpPanel";
import SideMenu from "components/SideMenu";
import { useTranslation } from "react-i18next";
import PipelineStatusComp from "./common/PipelineStatus";
import ButtonRefresh from "components/ButtonRefresh";
import { TestEnv, TestHistory } from "API";
import { startSingleTest } from "graphql/mutations";
import ATPSelect from "pages/testEnvs/Select";
const PAGE_SIZE = 10;

const CheckPointsHistory: React.FC = () => {
  const { id } = useParams();
  const { t } = useTranslation();

  const breadCrumbList = [
    { name: t("name"), link: "/" },
    { name: "Check Points", link: "/integration-test/checkpoints" },
    {
      name: id ?? ""
    }
  ];

  const navigate = useNavigate();
  const [loadingData, setLoadingData] = useState(false);
  const [testHistoriesList, setTestHistoriesList] = useState<TestHistory[]>([]);
  const [selectedTestHistories, setSelectedTestHistories] = useState<
    TestHistory[]
  >([]);
  const [disabledDetail, setDisabledDetail] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
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

  const asyncListTestHistory = async (hideLoading = false) => {
    try {
      if (!hideLoading) {
        setTestHistoriesList([]);
        setSelectedTestHistories([]);
        setLoadingData(true);
      }
      const resData: any = await appSyncRequestQuery(listTestHistory, {
        id: id,
        page: curPage,
        count: PAGE_SIZE,
        testEnvId: selectedEnvId
      });
      const testHistoryList: TestHistory[] =
        resData.data.listTestHistory.testHistories;
      setTotalCount(resData.data.listTestHistory.total);
      setTestHistoriesList(testHistoryList);
      setLoadingData(false);
    } catch (error) {
      console.error(error);
    }
  };

  const handlePageChange = (event: any, value: number) => {
    setCurPage(value);
  };

  const handleRetry = async () => {
    try {
      if (selectedTestHistories.length === 0) {
        console.error("No test history selected.");
        return;
      }
      const testHistory = selectedTestHistories[0];
      const parameters =
        testHistory
          .parameters!.map((item) =>
            "parameterKey" in item! && "parameterValue" in item
              ? {
                  parameterKey: item.parameterKey,
                  parameterValue: item.parameterValue
                }
              : null
          )
          .filter((item) => item !== null) || [];

      const resData = await appSyncRequestQuery(startSingleTest, {
        markerId: testHistory.markerId,
        parameters: parameters
      });

      console.info("Retry initiated, resData:", resData);
      navigate(
        `/integration-test/checkpoints/history/detail/${resData.data.startSingleTest}`
      );
    } catch (error) {
      console.error("Failed to retry test history:", error);
    }
  };

  // Click View Detail Button Redirect to detail page
  const clickToReviewDetail = () => {
    navigate(
      `/integration-test/checkpoints/history/detail/${selectedTestHistories[0]?.id}`
    );
  };

  useEffect(() => {
    asyncListTestHistory();
  }, [curPage, selectedEnvId]);

  useEffect(() => {
    if (selectedTestHistories.length === 1) {
      setDisabledDetail(false);
    } else {
      setDisabledDetail(true);
    }
  }, [selectedTestHistories]);

  // Auto Refresh List
  useEffect(() => {
    const refreshInterval = setInterval(() => {
      asyncListTestHistory(true);
    }, AUTO_REFRESH_INT);
    console.info("refreshInterval:", refreshInterval);
    return () => clearInterval(refreshInterval);
  }, [curPage, selectedEnvId]);

  const renderHistoryId = (data: TestHistory) => {
    return (
      <Link to={`/integration-test/checkpoints/history/detail/${data.id}`}>
        {data.id}
      </Link>
    );
  };

  const renderStatus = (data: TestHistory) => {
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
                defaultSelectItem={selectedTestHistories}
                title={"Test History"}
                changeSelected={(item) => {
                  setSelectedTestHistories(item);
                }}
                loading={loadingData}
                selectType={SelectType.RADIO}
                columnDefinitions={[
                  {
                    id: "id",
                    header: "ID",
                    width: 220,
                    cell: (e: TestHistory) => renderHistoryId(e)
                  },
                  {
                    width: 380,
                    id: "parameters",
                    header: t("Parameters"),
                    cell: (e: TestHistory) => {
                      if (e.parameters && e.parameters.length > 0) {
                        return e.parameters
                          .map((param) =>
                            param
                              ? `${param.parameterKey}: ${param.parameterValue}`
                              : ""
                          )
                          .join(", ");
                      }
                      return "No Parameters";
                    }
                  },
                  {
                    width: 150,
                    id: "createTime",
                    header: t("Created"),
                    cell: (e: TestHistory) => {
                      return e.createdAt;
                    }
                  },
                  {
                    id: "duration",
                    header: t("Duration"),
                    cell: (e: TestHistory) => {
                      return e.duration;
                    }
                  },
                  {
                    width: 120,
                    id: "status",
                    header: t("Status"),
                    cell: (e: TestHistory) => renderStatus(e)
                  }
                ]}
                items={testHistoriesList}
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
                          asyncListTestHistory();
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
                      onClick={() => handleRetry()}
                    >
                      {"Retry Test"}
                    </Button>
                  </div>
                }
                pagination={
                  <Pagination
                    count={Math.ceil(totalCount / PAGE_SIZE)}
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
    </div>
  );
};

export default CheckPointsHistory;
