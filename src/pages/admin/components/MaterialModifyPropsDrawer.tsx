import React from 'react';
import { Drawer, Button, Space } from 'antd';
import { FoldPanel } from '@/components/voltron-design-rc/FoldPanel';
import { uncontrolled } from '../utils';
import {
  PropTemplateKeyPathsRegInputInner,
  PropDefaultValueInputInner,
  PropDisplayNameInputInner,
  PropNameInputInner,
  PropTypeInputInner,
  PropTemplateKeyPathsRegErrorMessage,
  PropDisplayNameErrorMessage,
  PropNameErrorMessage,
  PropTypeErrorMessage,
  PropDefaultValueErrorMessage
} from './ModifyMaterialFormPropFields';
import { getModifyMaterialPropsFormModel, useModifyMaterialPropsFormData } from '../store/modifyMaterialPropsFormData';

import { FormFieldErrorWrapper } from './FormFieldErrorWrapper';
import { PropIdContext } from './PropIdContext';
import { Form } from 'antd';

import {
  createHandleRemovePropButtonClick,
  useAddPropsInModifyDrawerButton,
  handleModifyPropsSaveButtonClick,
  closeMaterialModifyPropsDrawer,
  useMaterialModifyPropsDrawerVisible
} from '../services';

import { createListComponentWithLength } from '../services/createList';

const UncontrolledFoldPanel = uncontrolled(FoldPanel);

const FormItem = Form.Item;

export function MaterialModifyPropsDrawer() {
  return (
    <DrawerWrapper>
      <WithMaterialModifyPropsDrawerVisible>
        <div className="flex flex-col gap-24">
          <PropsForm />
          <AddPropsButton />
        </div>
      </WithMaterialModifyPropsDrawerVisible>
    </DrawerWrapper>
  );
}

function DrawerWrapper({ children }: { children: React.ReactNode }) {
  const showModifyDrawer = useMaterialModifyPropsDrawerVisible();
  return (
    <Drawer
      open={showModifyDrawer}
      title="编辑组件"
      width={400}
      onClose={closeMaterialModifyPropsDrawer}
      footer={<Footer />}
    >
      {children}
    </Drawer>
  );
}

function Footer() {
  return (
    <Space style={{ float: 'right' }}>
      <Button onClick={closeMaterialModifyPropsDrawer}>取消</Button>
      <Button type="primary" onClick={handleModifyPropsSaveButtonClick}>
        保存
      </Button>
    </Space>
  );
}

function WithMaterialModifyPropsDrawerVisible({ children }: { children: React.ReactNode }) {
  const visible = useMaterialModifyPropsDrawerVisible();
  if (!visible) {
    return null;
  }
  return children;
}

/**
 * 属性面板列表组件
 * 组件名字: PropsForm
 * 获取列表长度的函数: 取 ModifyMaterialPropsFormModel 的 props 的长度
 * 获取列表的函数: 取 ModifyMaterialPropsFormModel 的 props
 * 获取列表项的 key 的函数: 取 props 的 id
 * 渲染列表项的函数: 渲染属性面板
 */
const PropsForm = createListComponentWithLength({
  componentName: 'PropsForm',
  useLength: () => useModifyMaterialPropsFormData(() => getModifyMaterialPropsFormModel().props.length),
  getList: () => getModifyMaterialPropsFormModel().props,
  getKey: prop => prop.id.get(),
  renderItem: prop => (
    <UncontrolledFoldPanel
      title="属性配置"
      desc="(解释说明)"
      onRemove={createHandleRemovePropButtonClick(prop.id.get())}
      key={prop.id.get()}
    >
      <PropIdContext.Provider value={prop.id.get()}>
        <div className="px-12 flex flex-col gap-24 pt-12 pb-28">
          <FormItem label="属性名称" required className="gap-0 flex-1 flex-col items-start">
            <FormFieldErrorWrapper className="w-full">
              <PropDisplayNameInputInner />
              <PropDisplayNameErrorMessage />
            </FormFieldErrorWrapper>
          </FormItem>
          <FormItem label="英文名" required className="gap-0 flex-1 flex-col items-start">
            <FormFieldErrorWrapper className="w-full">
              <PropNameInputInner />
              <PropNameErrorMessage />
            </FormFieldErrorWrapper>
          </FormItem>
          <FormItem label="数据类型" required className="gap-0 flex-1 flex-col items-start">
            <FormFieldErrorWrapper className="w-full">
              <PropTypeInputInner />
              <PropTypeErrorMessage />
            </FormFieldErrorWrapper>
          </FormItem>
          <FormItem label="默认值" required className="gap-0 flex-1 flex-col items-start">
            <FormFieldErrorWrapper className="w-full">
              <PropDefaultValueInputInner />
              <PropDefaultValueErrorMessage />
            </FormFieldErrorWrapper>
          </FormItem>
          <FormItem label="模板属性路径正则表达式" className="gap-0 flex-1 flex-col items-start">
            <FormFieldErrorWrapper className="w-full">
              <PropTemplateKeyPathsRegInputInner />
              <PropTemplateKeyPathsRegErrorMessage />
            </FormFieldErrorWrapper>
          </FormItem>
        </div>
      </PropIdContext.Provider>
    </UncontrolledFoldPanel>
  )
});

function AddPropsButton() {
  const [ref, handleClick] = useAddPropsInModifyDrawerButton();
  return (
    <div className="flex">
      <Button type="dashed" onClick={handleClick}>
        添加属性
      </Button>
      <div ref={ref as React.Ref<HTMLDivElement>} />
    </div>
  );
}
