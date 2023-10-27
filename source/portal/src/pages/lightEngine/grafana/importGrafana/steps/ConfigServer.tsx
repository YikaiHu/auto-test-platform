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

import FormItem from "components/FormItem";
import HeaderPanel from "components/HeaderPanel";
import TextInput from "components/TextInput";
import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import { GrafanaState, grafana } from "reducer/grafana";
import { GrafanaCheckList } from "../../components/GrafanaCheckList";


export const ConfigServer = (props: GrafanaState & { isNameReadOnly: boolean }) => {
  const grafanaState = props;
  const dispatch = useDispatch<any>();
  const { t } = useTranslation();

  const nameInput = useMemo(
    () => (
      <FormItem
        optionTitle={t("lightengine:grafana.create.name")}
        optionDesc={t("lightengine:grafana.create.nameDesc")}
        errorText={props.grafanaNameError}
      >
        <TextInput
          placeholder="clo-grafana"
          onChange={(e) =>
            dispatch(grafana.actions.nameChanged(e.target.value))
          }
          onBlur={(e) => dispatch(grafana.actions.nameChanged(e.target.value))}
          value={grafanaState.grafanaName}
          readonly={props.isNameReadOnly}
        />
      </FormItem>
    ),
    [grafanaState.grafanaName]
  );

  const urlInput = useMemo(
    () => (
      <FormItem
        optionTitle={t("lightengine:grafana.create.url")}
        optionDesc={t("lightengine:grafana.create.urlDesc")}
        errorText={props.grafanaUrlError}
      >
        <TextInput
          placeholder="https://my-grafana.corporate.com:3000"
          onChange={(e) => dispatch(grafana.actions.urlChanged(e.target.value))}
          onBlur={(e) => dispatch(grafana.actions.urlChanged(e.target.value))}
          value={grafanaState.grafanaUrl}
        />
      </FormItem>
    ),
    [grafanaState.grafanaUrl]
  );

  const tokenInput = useMemo(
    () => (
      <FormItem
        optionTitle={t("lightengine:grafana.create.token")}
        optionDesc={t("lightengine:grafana.create.tokenDesc")}
        errorText={props.grafanaTokenError}
      >
        <TextInput
          placeholder="glsa_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
          onChange={(e) =>
            dispatch(grafana.actions.tokenChanged(e.target.value))
          }
          onBlur={(e) => dispatch(grafana.actions.tokenChanged(e.target.value))}
          value={grafanaState.grafanaToken}
        />
      </FormItem>
    ),
    [grafanaState.grafanaToken]
  );

  return (
    <div>
      <HeaderPanel title={t("lightengine:grafana.create.server")}>
        {nameInput}
        {urlInput}
        {tokenInput}
        <GrafanaCheckList/>
      </HeaderPanel>
    </div>
  );
};
