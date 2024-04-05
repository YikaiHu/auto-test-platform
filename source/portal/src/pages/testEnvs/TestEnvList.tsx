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
import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { SelectType, TablePanel } from "components/TablePanel";
import Button from "components/Button";
import { TestEnv } from "API";
import { Link, useNavigate } from "react-router-dom";
import { Pagination } from "@material-ui/lab";
import { appSyncRequestMutation, appSyncRequestQuery } from "assets/js/request";
import { listTestEnvs } from "graphql/queries";
import { deleteTestEnv } from "graphql/mutations";
import Modal from "components/Modal";
import { handleErrorMessage } from "assets/js/alert";
import ButtonRefresh from "components/ButtonRefresh";
import CommonLayout from "pages/layout/CommonLayout";

const PAGE_SIZE = 10;

const TestEnvList: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const breadCrumbList = [
    { name: t("name"), link: "/" },
    { name: "Test Environments" },
  ];

  const [loadingData, setLoadingData] = useState(false);
  const [disabledDelete, setDisabledDelete] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState(false);
  const [totalCount, setTotoalCount] = useState(0);
  const [curPage, setCurPage] = useState(1);
  const [textEnvList, setTextEnvList] = useState<TestEnv[]>(
    []
  );
  const [curTestEnv, setCurAccount] = useState<TestEnv>();
  const [openDeleteModel, setOpenDeleteModel] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<TestEnv[]>();

  // Get Member Account List
  const getTextEnvList = async () => {
    try {
      setTextEnvList([]);
      setSelectedAccount([]);
      setLoadingData(true);
      const resData: any = await appSyncRequestQuery(listTestEnvs, {
        page: curPage,
        count: PAGE_SIZE,
      });
      console.info("resData:", resData);
      const dataTestEnvList: TestEnv[] =
        resData.data.listTestEnvs?.testEnvs || [];
      setTotoalCount(resData.data.listTestEnvs?.total || 0);
      setTextEnvList(dataTestEnvList);
      setLoadingData(false);
    } catch (error) {
      console.error(error);
    }
  };

  const removeTextEnv = async () => {
    setCurAccount(selectedAccount?.[0]);
    setOpenDeleteModel(true);
  };

  const confirmRemoveTextEnv = async () => {
    try {
      setLoadingDelete(true);
      const removeRes = await appSyncRequestMutation(deleteTestEnv, {
        id: curTestEnv?.id,
      });
      console.info("removeRes:", removeRes);
      setLoadingDelete(false);
      setOpenDeleteModel(false);
      getTextEnvList();
    } catch (error: any) {
      setLoadingDelete(false);
      handleErrorMessage(error.message);
      console.error(error);
    }
  };

  const handlePageChange = (event: any, value: number) => {
    setCurPage(value);
  };

  // Disable delete button when no row selected.
  useEffect(() => {
    if (selectedAccount && selectedAccount.length > 0) {
      setDisabledDelete(false);
    } else {
      setDisabledDelete(true);
    }
  }, [selectedAccount]);

  useEffect(() => {
    getTextEnvList();
  }, []);

  const renderAccountId = (data: TestEnv) => {
    return (
      <Link to={`/test-env/environments/detail/${data.id}`}>
        {data.envName}
      </Link>
    );
  };

  return (
    <CommonLayout breadCrumbList={breadCrumbList}>
      <div className="table-data">
        <TablePanel
          trackId="subAccountId"
          title={"Test Environments"}
          changeSelected={(item) => {
            setSelectedAccount(item);
          }}
          loading={loadingData}
          selectType={SelectType.RADIO}
          columnDefinitions={[
            {
              // width: 110,
              id: "EnvName",
              header: "Environment Name",
              cell: (e: TestEnv) => renderAccountId(e),
            },
            {
              id: "AccountId",
              header: "Account ID",
              cell: (e: TestEnv) => {
                return e.accountId;
              },
            },
            {
              id: "Region",
              header: "Region",
              cell: (e: TestEnv) => {
                return e.region;
              },
            },
            {
              width: 170,
              id: "AlarmEmail",
              header: "Alarm Email",
              cell: (e: TestEnv) => {
                return e.alarmEmail;
              },
            },
          ]}
          items={textEnvList}
          actions={
            <div>
              <Button
                btnType="icon"
                disabled={loadingData}
                onClick={() => {
                  if (curPage === 1) {
                    getTextEnvList();
                  } else {
                    setCurPage(1);
                  }
                }}
              >
                <ButtonRefresh loading={loadingData} fontSize="small" />
              </Button>

              <Button
                disabled={disabledDelete}
                onClick={() => {
                  removeTextEnv();
                }}
              >
                {t("button.remove")}
              </Button>

              <Button
                btnType="primary"
                onClick={() => {
                  navigate("/test-env/environments/import");
                }}
              >
                {"Import Test Environment"}
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
      <Modal
        title={"Remove"}
        fullWidth={false}
        isOpen={openDeleteModel}
        closeModal={() => {
          setOpenDeleteModel(false);
        }}
        actions={
          <div className="button-action no-pb text-right">
            <Button
              btnType="text"
              disabled={loadingDelete}
              onClick={() => {
                setOpenDeleteModel(false);
              }}
            >
              {t("button.cancel")}
            </Button>
            <Button
              loading={loadingDelete}
              btnType="primary"
              onClick={() => {
                confirmRemoveTextEnv();
              }}
            >
              {t("button.remove")}
            </Button>
          </div>
        }
      >
        <div className="modal-content">
          {"Remove"}
          <b>{` ${curTestEnv?.envName}`}</b> {"?"}
        </div>
      </Modal>
    </CommonLayout>
  );
};

export default TestEnvList;
