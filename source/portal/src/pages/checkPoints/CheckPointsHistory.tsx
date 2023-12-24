import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Pagination from "@material-ui/lab/Pagination";
import Button from "components/Button";
import { TablePanel } from "components/TablePanel";
import Breadcrumb from "components/Breadcrumb";
import { SelectType } from "components/TablePanel/tablePanel";
import { appSyncRequestQuery } from "assets/js/request";
import { listTestCheckPoints } from "graphql/queries";
import { AUTO_REFRESH_INT } from "assets/js/const";
import HelpPanel from "components/HelpPanel";
import SideMenu from "components/SideMenu";
import { useTranslation } from "react-i18next";
import PipelineStatusComp from "./common/PipelineStatus";
import ButtonRefresh from "components/ButtonRefresh";
import { CheckPoint, CheckPointStatus } from "API";
const PAGE_SIZE = 10;

const CheckPointsHistory: React.FC = () => {
  const { id } = useParams();
  const { t } = useTranslation();

  const breadCrumbList = [
    { name: t("name"), link: "/" },
    { name: "Check Points", link: "/integration-test/checkpoints" },
    {
      name: id || "",
    },
  ];

  const navigate = useNavigate();
  const [loadingData, setLoadingData] = useState(false);
  const [checkPointsList, setCheckPointsList] = useState<CheckPoint[]>([]);
  const [selectedCheckPoints, setSelectedCheckPoints] = useState<any[]>([]);
  const [disabledDetail, setDisabledDetail] = useState(false);
  const [totoalCount, setTotoalCount] = useState(0);
  const [curPage, setCurPage] = useState(1);

  const getTestHistory = async (hideLoading = false) => {
    try {
      if (!hideLoading) {
        setCheckPointsList([]);
        setSelectedCheckPoints([]);
        setLoadingData(true);
      }
      const resData: any = await appSyncRequestQuery(listTestCheckPoints, {
        page: curPage,
        count: PAGE_SIZE,
      });
      const dataPipelineList: CheckPoint[] =
        resData.data.listTestCheckPoints.checkPoints;
      setTotoalCount(resData.data.listTestCheckPoints.total);
      setCheckPointsList(dataPipelineList);
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
    navigate(`/integration-test/checkpoints/history/detail${selectedCheckPoints[0]?.id}`);
  };

  useEffect(() => {
    getTestHistory();
  }, [curPage]);

  useEffect(() => {
    if (selectedCheckPoints.length === 1) {
      setDisabledDetail(false);
    } else {
      setDisabledDetail(true);
    }
    if (selectedCheckPoints.length > 0) {
      if (
        selectedCheckPoints[0].status === CheckPointStatus.ACTIVE ||
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
      getTestHistory(true);
    }, AUTO_REFRESH_INT);
    console.info("refreshInterval:", refreshInterval);
    return () => clearInterval(refreshInterval);
  }, [curPage]);

  const renderPipelineId = (data: CheckPoint) => {
    return (
      <Link to={`/integration-test/checkpoints/history/detail/${data.id}`}>{data.id}</Link>
    );
  };

  const renderStatus = (data: CheckPoint) => {
    return (
      <PipelineStatusComp
        status={data.status}
        stackId={data.id}
        error={data.error}
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
                title={"Test History"}
                changeSelected={(item) => {
                  setSelectedCheckPoints(item);
                }}
                loading={loadingData}
                selectType={SelectType.RADIO}
                columnDefinitions={[
                  {
                    id: "id",
                    header: "ID",
                    width: 220,
                    cell: (e: CheckPoint) => renderPipelineId(e),
                  },
                  {
                    width: 150,
                    id: "type",
                    header: t("servicelog:list.projectName"),
                    cell: (e: CheckPoint) => {
                      return e.projectName;
                    },
                  },
                  {
                    width: 150,
                    id: "account",
                    header: t("servicelog:list.modelName"),
                    cell: (e: CheckPoint) => {
                      return e.modelName;
                    },
                  },
                  {
                    id: "source",
                    header: t("servicelog:list.checkPointName"),
                    cell: (e: CheckPoint) => {
                      return e.name;
                    },
                  },
                  {
                    id: "createTime",
                    header: "Create Time",
                    cell: (e: CheckPoint) => {
                      return e.name;
                    },
                  },
                  {
                    width: 120,
                    id: "status",
                    header: t("servicelog:list.status"),
                    cell: (e: CheckPoint) => renderStatus(e),
                  },
                ]}
                items={checkPointsList}
                actions={
                  <div>
                    <Button
                      btnType="icon"
                      disabled={loadingData}
                      onClick={() => {
                        if (curPage === 1) {
                          getTestHistory();
                        } else {
                          setCurPage(1);
                        }
                      }}
                    >
                      <ButtonRefresh loading={loadingData} />
                    </Button>
                    <Button
                      disabled={disabledDetail}
                      onClick={() => {
                        clickToReviewDetail();
                      }}
                    >
                      {t("button.viewDetail")}
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
    </div>
  );
};

export default CheckPointsHistory;
