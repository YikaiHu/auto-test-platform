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
import React, { useState } from "react";
import { useTranslation } from "react-i18next";

import "./home.scss";
import Button from "components/Button";
import HeaderPanel from "components/HeaderPanel";
import { useNavigate } from "react-router";
import SideMenu from "components/SideMenu";
import {
  buildSolutionDocsLink,
  URL_FEEDBACK,
} from "assets/js/const";

enum NavigateType {
  UTStatus = "UTStatus",
}

const HomeSelectOptions = [
  {
    title: "home:getStarted.utStatus",
    desc: "home:getStarted.utStatusDesc",
    value: NavigateType.UTStatus,
  },
];

const Home: React.FC = () => {
  const [createType, setCreateType] = useState<string>(NavigateType.UTStatus);
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className="lh-main-content">
      <SideMenu />
      <div className="lh-container">
        <div className="home-header">
          <div className="home-header-content">
            <div className="home-header-tc">
              <div className="main-title">{t("name")}</div>
              <div className="main-desc">{t("home:subTitle")}</div>
              <div className="small-desc">{t("home:subDesc")}</div>
            </div>
          </div>
        </div>
        <div className="home-content">
          <div className="home-content-left">
            <div className="home-box-title">{t("home:benefits.title")}</div>
            <div className="home-box">
              <div className="box-item">
                <div className="sub-title">
                  {t("home:benefits.consoleTitle")}
                </div>
                <div>{t("home:benefits.consoleDesc")}</div>
              </div>
              <div className="box-item">
                <div className="sub-title">
                  {t("home:benefits.ingestionTitle")}
                </div>
                <div>{t("home:benefits.ingestionDesc")}</div>
              </div>
              <div className="box-item">
                <div className="sub-title">
                  {t("home:benefits.codelessTitle")}
                </div>
                <div>{t("home:benefits.codelessDesc")}</div>
              </div>
              <div className="box-item">
                <div className="sub-title">
                  {t("home:benefits.insightTitle")}
                </div>
                <div>{t("home:benefits.insightDesc")}</div>
              </div>
            </div>
          </div>
          <div className="home-content-right">
            <div className="get-start-box">
              <div className="start-title">{t("home:getStarted.title")}</div>
              {HomeSelectOptions.map((element) => {
                return (
                  <div key={element.title} className="home-select-item">
                    <label className="flex">
                      <div>
                        <input
                          checked={createType === element.value}
                          onChange={(event) => {
                            setCreateType(event.target.value);
                          }}
                          value={element.value}
                          name="createType"
                          type="radio"
                        />
                      </div>
                      <div>
                        <div className="sel-title">{t(element.title)}</div>
                        <div className="sel-desc">{t(element.desc)}</div>
                      </div>
                    </label>
                  </div>
                );
              })}

              <div className="mt-10">
                {createType === NavigateType.UTStatus && (
                  <Button
                    btnType="primary"
                    onClick={() => {
                      navigate("/integration-test/checkpoints");
                    }}
                  >
                    {t("button.gotoStatus")}
                  </Button>
                )}
              </div>
            </div>

            <div>
              <HeaderPanel
                contentNoPadding
                title={t("home:gettingStarted.title")}
              >
                <ul className="home-link-ul">
                  <li>
                    <a
                      href={buildSolutionDocsLink("getting-started.html")}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {t("home:gettingStarted.firstInSolution")}
                    </a>
                  </li>
                </ul>
              </HeaderPanel>
            </div>

            <div>
              <HeaderPanel
                contentNoPadding
                title={t("home:moreResource.title")}
              >
                <ul className="home-link-ul">
                  <li>
                    <a
                      href={buildSolutionDocsLink("")}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {t("home:moreResource.doc")}
                    </a>
                  </li>
                  <li>
                    <a
                      href={buildSolutionDocsLink(
                        "frequently-asked-questions.html"
                      )}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {t("home:moreResource.faq")}
                    </a>
                  </li>
                  <li>
                    <a href={URL_FEEDBACK} target="_blank" rel="noreferrer">
                      {t("home:moreResource.issue")}
                    </a>
                  </li>
                </ul>
              </HeaderPanel>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
