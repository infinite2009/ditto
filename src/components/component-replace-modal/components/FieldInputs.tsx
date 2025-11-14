import React from 'react';
import createFieldInput from './createFieldInput';

export const NameInput = React.memo(
  createFieldInput({
    label: '组件名称',
    placeholder: '请输入组件名称',
    maxLength: 20,
    getValueFromStore: state => state.values.name,
    getValueSetterFromStore: state => state.setName,
    getErrorMsgFromStore: state => state.errors?.name,
  })
);

export const DependencyInput = React.memo(
  createFieldInput({
    label: '导入路径',
    placeholder: '请输入导入路径',
    getValueFromStore: state => state.values.dependency,
    getValueSetterFromStore: state => state.setDependency,
    getErrorMsgFromStore: state => state.errors?.dependency
  })
);

DependencyInput.displayName = 'DependencyInput';
NameInput.displayName = 'NameInput';
