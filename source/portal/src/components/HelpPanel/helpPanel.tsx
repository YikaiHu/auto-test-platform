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
import React from "react";
import { useSelector, useDispatch } from "react-redux";
import CloseIcon from "@material-ui/icons/Close";
import ErrorOutlineIcon from "@material-ui/icons/ErrorOutline";
import {
  ActionType,
  InfoBarTitleMap,
  InfoBarTypes,
} from "reducer/appReducer";
import Alarms from "help/Alarms";
import { RootState } from "reducer/reducers";
import { useTranslation } from "react-i18next";

interface HelpPanelProps {
  className?: string;
}

export const HelpPanel: React.FC<HelpPanelProps> = (props: HelpPanelProps) => {
  const { className } = props;
  const { showInfoBar, infoBarType } = useSelector(
    (state: RootState) => state.app
  );
  const dispatch = useDispatch();
  const { t } = useTranslation();

  return (
    <div
      className={`${className} lh-helper`}
      style={{ marginRight: showInfoBar ? undefined : -240 }}
    >
      <div className="gsui-help-panel-title">
        {!showInfoBar && (
          <div className="collapse-menu">
            <ErrorOutlineIcon className="reverse menu-icon" />
          </div>
        )}
        {showInfoBar && (
          <div className="flex-1">
            <div>
              <CloseIcon
                onClick={() => {
                  dispatch({ type: ActionType.CLOSE_INFO_BAR });
                }}
                className="close-icon"
              />
              <div className="head-title">
                {t(InfoBarTitleMap[infoBarType || ""])}
              </div>
            </div>
          </div>
        )}
      </div>
      {showInfoBar && (
        <div>
          {infoBarType === InfoBarTypes.ALARMS && <Alarms />}
        </div>
      )}
    </div>
  );
};

HelpPanel.defaultProps = {
  className: "",
};

export default HelpPanel;
