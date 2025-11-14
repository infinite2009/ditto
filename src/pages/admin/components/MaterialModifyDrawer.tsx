import React from 'react';
import { Drawer, Space } from 'antd';
import { Button, FormItem } from '@bilibili/voltron-design';
import { FormFieldErrorWrapper } from './FormFieldErrorWrapper';
import {
  CallingNameErrorMessage,
  CallingNameInput,
  CategoriesErrorMessage,
  CategoriesInput,
  ConfigNameErrorMessage,
  ConfigNameInput,
  CoverUrlErrorMessage,
  CoverUrlInput,
  DisplayNameErrorMessage,
  DisplayNameInput,
  FeatureErrorMessage,
  FeatureInput,
  ImportNameErrorMessage,
  ImportNameInput,
  IsHiddenErrorMessage,
  IsHiddenInput,
  IsLayerErrorMessage,
  IsLayerInput,
  KeywordsErrorMessage,
  KeywordsInput,
  NeedImportErrorMessage,
  NeedImportInput,
  PackageNameErrorMessage,
  PackageNameInput,
  UploadCoverField
} from './ModifyMaterialFormFields';
import { createUpdateMaterialData } from '../services/updateMaterialData';
import { getModifyMaterialFormModel, useModifyMaterialFormData } from '../store/modifyMaterialFormData';
import {
  closeMaterialModifyDrawerVisible,
  useMaterialModifyDrawerVisible
} from '../services/useMaterialModifyDrawerVisible';

export function MaterialModifyDrawer() {
  return (
    <DrawerWrapper>
      <UploadCoverField />
      <MaterialModifyDrawerForm />
    </DrawerWrapper>
  );
}

function DrawerWrapper({ children }: { children: React.ReactNode }) {
  const showModifyDrawer = useMaterialModifyDrawerVisible();
  return (
    <Drawer
      open={showModifyDrawer}
      title="编辑组件"
      width={400}
      onClose={closeMaterialModifyDrawerVisible}
      footer={<Footer />}
    >
      {children}
    </Drawer>
  );
}

function Footer() {
  const updateMaterialData = createUpdateMaterialData(getModifyMaterialFormModel);
  return (
    <Space style={{ float: 'right' }}>
      <Button onClick={closeMaterialModifyDrawerVisible}>取消</Button>
      <Button type="primary" onClick={updateMaterialData}>
        保存
      </Button>
    </Space>
  );
}

function MaterialModifyDrawerForm() {
  const modifyMaterialFormData = useModifyMaterialFormData(() => getModifyMaterialFormModel());

  if (!modifyMaterialFormData) {
    return null;
  }

  return (
    <div className="grid grid-cols-[80px_auto] gap-x-8 gap-y-24 col items-center">
      <FormItem asFragment label="组件库" required>
        <FormFieldErrorWrapper>
          <PackageNameInput placeholder="请选择" />
          <PackageNameErrorMessage />
        </FormFieldErrorWrapper>
      </FormItem>
      <FormItem asFragment label="组件名称" required>
        <FormFieldErrorWrapper>
          <DisplayNameInput placeholder="请输入" />
          <DisplayNameErrorMessage />
        </FormFieldErrorWrapper>
      </FormItem>
      <FormItem asFragment label="组件调用名" required>
        <FormFieldErrorWrapper>
          <CallingNameInput placeholder="请输入" />
          <CallingNameErrorMessage />
        </FormFieldErrorWrapper>
      </FormItem>
      <FormItem asFragment label="组件特性">
        <FormFieldErrorWrapper>
          <FeatureInput placeholder="请输入" />
          <FeatureErrorMessage />
        </FormFieldErrorWrapper>
      </FormItem>
      <FormItem asFragment label="是否图层组件">
        <FormFieldErrorWrapper>
          <IsLayerInput />
          <IsLayerErrorMessage />
        </FormFieldErrorWrapper>
      </FormItem>
      <FormItem asFragment label="导入名称" required>
        <FormFieldErrorWrapper>
          <ImportNameInput placeholder="请输入" />
          <ImportNameErrorMessage />
        </FormFieldErrorWrapper>
      </FormItem>
      <FormItem asFragment label="配置名称" required>
        <FormFieldErrorWrapper>
          <ConfigNameInput placeholder="请输入" />
          <ConfigNameErrorMessage />
        </FormFieldErrorWrapper>
      </FormItem>
      <FormItem asFragment label="分类">
        <FormFieldErrorWrapper>
          <CategoriesInput placeholder="请输入" />
          <CategoriesErrorMessage />
        </FormFieldErrorWrapper>
      </FormItem>
      <FormItem asFragment label="关键词">
        <FormFieldErrorWrapper>
          <KeywordsInput placeholder="请输入" />
          <KeywordsErrorMessage />
        </FormFieldErrorWrapper>
      </FormItem>
      <FormItem asFragment label="封面URL">
        <FormFieldErrorWrapper>
          <CoverUrlInput placeholder="请输入" />
          <CoverUrlErrorMessage />
        </FormFieldErrorWrapper>
      </FormItem>
      <FormItem asFragment label="是否需要导入">
        <FormFieldErrorWrapper>
          <NeedImportInput />
          <NeedImportErrorMessage />
        </FormFieldErrorWrapper>
      </FormItem>
      <FormItem asFragment label="是否隐藏">
        <FormFieldErrorWrapper>
          <IsHiddenInput />
          <IsHiddenErrorMessage />
        </FormFieldErrorWrapper>
      </FormItem>
      {/*<FormItem asFragment label="是否黑盒">*/}
      {/*  <FormFieldErrorWrapper>*/}
      {/*    <IsBlackBoxInput />*/}
      {/*    <IsBlackBoxErrorMessage />*/}
      {/*  </FormFieldErrorWrapper>*/}
      {/*</FormItem>*/}
    </div>
  );
}