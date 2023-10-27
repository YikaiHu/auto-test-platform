/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.

Licensed under the Apache License, Version 2.0 (the "License").
You may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/
/* eslint-disable react/display-name */
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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
import { formatLocalTime } from "assets/js/utils";
import { useTranslation } from "react-i18next";
import PipelineStatusComp from "../common/PipelineStatus";
import ButtonRefresh from "components/ButtonRefresh";
import { CheckPoint, CheckPointStatus } from "API";

const PAGE_SIZE = 10;

const ServiceLog: React.FC = () => {
  const { t } = useTranslation();
  const breadCrumbList = [
    { name: t("name"), link: "/" },
    { name: t("servicelog:name") },
  ];

  const navigate = useNavigate();
  const [loadingData, setLoadingData] = useState(false);
  const [serviceLogList, setServiceLogList] = useState<CheckPoint[]>([]);
  // const [curTipsServiceLog, setCurTipsServiceLog] = useState<ServicePipeline>();
  const [selectedServiceLog, setSelectedServiceLog] = useState<any[]>([]);
  const [disabledDetail, setDisabledDetail] = useState(false);
  const [totoalCount, setTotoalCount] = useState(0);
  const [curPage, setCurPage] = useState(1);

  // Get Service Log List
  const getServiceLogList = async (hideLoading = false) => {
    try {
      if (!hideLoading) {
        setServiceLogList([]);
        setSelectedServiceLog([]);
        setLoadingData(true);
      }
      const resData: any = await appSyncRequestQuery(listTestCheckPoints, {
        page: curPage,
        count: PAGE_SIZE,
      });
      const dataPipelineList: CheckPoint[] =
        resData.data.listTestCheckPoints.pipelines;
      setTotoalCount(resData.data.listTestCheckPoints.total);
      setServiceLogList(dataPipelineList);
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
    navigate(`/log-pipeline/service-log/detail/${selectedServiceLog[0]?.id}`);
  };

  // Get Service log list when page rendered.
  useEffect(() => {
    getServiceLogList();
  }, [curPage]);

  // Disable delete button and view detail button when no row selected.
  useEffect(() => {
    console.info("selectedServiceLog:", selectedServiceLog);
    if (selectedServiceLog.length === 1) {
      setDisabledDetail(false);
    } else {
      setDisabledDetail(true);
    }
    if (selectedServiceLog.length > 0) {
      if (
        selectedServiceLog[0].status === CheckPointStatus.ACTIVE ||
        selectedServiceLog[0].status === CheckPointStatus.ERROR
      ) {
        // setDisabledDelete(false);
      } else {
        // setDisabledDelete(true);
      }
    } else {
      // setDisabledDelete(true);
    }
  }, [selectedServiceLog]);

  // Auto Refresh List
  useEffect(() => {
    const refreshInterval = setInterval(() => {
      getServiceLogList(true);
    }, AUTO_REFRESH_INT);
    console.info("refreshInterval:", refreshInterval);
    return () => clearInterval(refreshInterval);
  }, [curPage]);

  const renderPipelineId = (data: CheckPoint) => {
    return (
      <Link to={`/log-pipeline/service-log/detail/${data.id}`}>{data.id}</Link>
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
                defaultSelectItem={selectedServiceLog}
                title={t("servicelog:title")}
                changeSelected={(item) => {
                  setSelectedServiceLog(item);
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
                      return (
                        e.modelName
                      );
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
                    id: "cluster",
                    header: t("applog:list.logLink"),
                    cell: ({ logLink }: CheckPoint) => {
                      return (
                        logLink
                      );
                    },
                  },
                  {
                    width: 170,
                    id: "created",
                    header: t("servicelog:list.created"),
                    cell: (e: CheckPoint) => {
                      return formatLocalTime(e?.createdAt || "");
                    },
                  },
                  {
                    width: 120,
                    id: "status",
                    header: t("servicelog:list.status"),
                    cell: (e: CheckPoint) => renderStatus(e),
                  },
                ]}
                items={serviceLogList}
                actions={
                  <div>
                    <Button
                      btnType="icon"
                      disabled={loadingData}
                      onClick={() => {
                        if (curPage === 1) {
                          getServiceLogList();
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

export default ServiceLog;
