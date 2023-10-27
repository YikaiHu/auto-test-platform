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
import HeaderWithValueLabel from "pages/comps/HeaderWithValueLabel";
import React from "react";
import { useTranslation } from "react-i18next";
import { SvcDetailProps } from "../ServiceLogDetail";

const LogProcessor: React.FC<SvcDetailProps> = () => {
  const { t } = useTranslation();
  return (
    <HeaderWithValueLabel
      numberOfColumns={3}
      headerTitle={t("servicelog:tab.logProcessor")}
      fixedDataList={[]}
    />
  );
};

export default LogProcessor;
