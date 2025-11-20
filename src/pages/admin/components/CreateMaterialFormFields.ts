import React from 'react';
import { KeyOfMaterialDTOVisible, KeyOfMaterialPropsDTOVisible } from '../types';
import { createMaterialFormInputAndErrorMessage, createMaterialFormOneFieldWith } from '../formutils/services';
import { Input } from 'antd';
import { getCreateMaterialFormModel, useCreateMaterialFormData } from '../store/createMaterialFormData';
import { ImageInput } from './inputs';
import { useCurrentPropId } from './PropIdContext';

/** 需要被必填校验的物料数据字段 */
export const requiredInMaterialFields: KeyOfMaterialDTOVisible[] = ['package', 'displayName', 'callingName'];

/** 需要被必填校验的物料属性数据字段 */
export const requiredInPropsFields: KeyOfMaterialPropsDTOVisible[] = [
  'propName',
  'valueType',
  'displayName',
  'defaultValue',
];

/** 创建表单表单所需的字段与错误 UI */
export const [
  [PackageNameInput, PackageNameErrorMessage],
  [DisplayNameInput, DisplayNameErrorMessage],
  [CallingNameInput, CallingNameErrorMessage],
  [FeatureInput, FeatureErrorMessage],
  [IsLayerInput, IsLayerErrorMessage]
] = createMaterialFormInputAndErrorMessage(
  ['package', 'displayName', 'callingName', 'feature', 'isLayer'],
  getCreateMaterialFormModel,
  useCreateMaterialFormData,
  props => React.createElement(Input, props)
);

export const UploadCoverField = createMaterialFormOneFieldWith(
  'coverUrl',
  getCreateMaterialFormModel,
  useCreateMaterialFormData,
  props => React.createElement(ImageInput, props as any)
);

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
    return getCreateMaterialFormModel().props.find(prop => prop.id.get() === id);
  },
  useCreateMaterialFormData,
  props => React.createElement(Input, props)
);
