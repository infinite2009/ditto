import React from "react";
import { createMaterialFormInputAndErrorMessage } from "../formutils/services";
import { getModifyMaterialPropsFormModel, useModifyMaterialPropsFormData } from "../store/modifyMaterialPropsFormData";
import { useCurrentPropId } from "./PropIdContext";
import { Input } from "antd";

export const [
  [PropDisplayNameInputInner, PropDisplayNameErrorMessage],
  [PropTemplateKeyPathsRegInputInner, PropTemplateKeyPathsRegErrorMessage],
  [PropDefaultValueInputInner, PropDefaultValueErrorMessage],
  [PropTypeInputInner, PropTypeErrorMessage],
  [PropNameInputInner, PropNameErrorMessage]
] = createMaterialFormInputAndErrorMessage(
  ['displayName', 'templateKeyPathsReg', 'defaultValue', 'valueType', 'propName'],
  () => {
    const id = useCurrentPropId();
    return getModifyMaterialPropsFormModel().props.find(prop => prop.id.get() === id);
  },
  useModifyMaterialPropsFormData,
  props => React.createElement(Input, props)
);
