import {zip} from 'ramda';
import {KeyOfMaterialDTOVisible} from '../types';
import {
  createMaterialFormFieldErrorMessage,
  createMaterialFormInputAndErrorMessage,
  createMaterialFormOneFieldWith
} from '../formutils/services';
import React from 'react';
import {Input} from 'antd';
import {ImageInput, NumberBooleanSelect} from './inputs';
import {getModifyMaterialFormModel, useModifyMaterialFormData} from '../store/modifyMaterialFormData';

/** 创建 FormModal 里的多个字段 UI 和错误信息 UI */
export function createNumberBooleanSelectAndErrorMessage(keys: KeyOfMaterialDTOVisible[]) {
  const Select = keys.map(key =>
    createMaterialFormOneFieldWith(key, getModifyMaterialFormModel, useModifyMaterialFormData, props =>
      React.createElement(NumberBooleanSelect, props as any)
    )
  );
  const ErrorMessage = createMaterialFormFieldErrorMessage(keys, useModifyMaterialFormData, getModifyMaterialFormModel);
  return zip(Select, ErrorMessage);
}

export const [
  [IsLayerInput, IsLayerErrorMessage],
  [NeedImportInput, NeedImportErrorMessage],
  [IsHiddenInput, IsHiddenErrorMessage],
  // [IsBlackBoxInput, IsBlackBoxErrorMessage]
] = createNumberBooleanSelectAndErrorMessage(['isLayer', 'needImport', 'isHidden', /*'isBlackBox'*/]);

export const [
  [PackageNameInput, PackageNameErrorMessage],
  [DisplayNameInput, DisplayNameErrorMessage],
  [CallingNameInput, CallingNameErrorMessage],
  [FeatureInput, FeatureErrorMessage],
  [ImportNameInput, ImportNameErrorMessage],
  [ConfigNameInput, ConfigNameErrorMessage],
  [CategoriesInput, CategoriesErrorMessage],
  [KeywordsInput, KeywordsErrorMessage],
  [CoverUrlInput, CoverUrlErrorMessage]
] = createMaterialFormInputAndErrorMessage(
  [
    'package',
    'displayName',
    'callingName',
    'feature',
    'importName',
    'configName',
    'categories',
    'keywords',
    'coverUrl'
  ],
  getModifyMaterialFormModel,
  useModifyMaterialFormData,
  props => React.createElement(Input, props)
);

export const UploadCoverField = createMaterialFormOneFieldWith(
  'coverUrl',
  getModifyMaterialFormModel,
  useModifyMaterialFormData,
  props => React.createElement(ImageInput, props as any)
);
