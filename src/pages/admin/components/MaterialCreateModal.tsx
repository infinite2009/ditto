import React from 'react';
import { VoltronModalWithPortal } from '@/components/VoltronModalWithPortal';
import { Button, Form } from 'antd';
import { useAdminPageStore } from '../store/store';
import { createStoreBooleanSetter } from '../utils';
import { uncontrolled } from '../utils';
import { MaterialPropsDTO } from '../types';
import { createMaterialData } from '../services/createMaterialData';
import { useScrollIntoView } from '../services/useScrollIntoView';
import {
  PackageNameInput,
  DisplayNameInput,
  CallingNameInput,
  FeatureInput,
  IsLayerInput,
  PackageNameErrorMessage,
  DisplayNameErrorMessage,
  CallingNameErrorMessage,
  FeatureErrorMessage,
  IsLayerErrorMessage,
  UploadCoverField,
  PropTemplateKeyPathsRegInputInner,
  PropDefaultValueErrorMessage,
  PropDefaultValueInputInner,
  PropDisplayNameErrorMessage,
  PropDisplayNameInputInner,
  PropNameErrorMessage,
  PropNameInputInner,
  PropTemplateKeyPathsRegErrorMessage,
  PropTypeErrorMessage,
  PropTypeInputInner
} from './CreateMaterialFormFields';
import { FormFieldErrorWrapper } from './FormFieldErrorWrapper';
import {
  getCreateMaterialFormModel,
  notifyCreateMaterialFormUpdate,
  useCreateMaterialFormData
} from '../store/createMaterialFormData';
import { createFormModel } from '../formutils/transformer';
import { nanoid } from 'nanoid';
import { PropIdContext } from './PropIdContext';
import { FoldPanel } from '@/components/ditto-design-rc/FoldPanel';
import { createListComponentWithLength } from '../services/createList';
const UncontrolledFoldPanel = uncontrolled(FoldPanel);

const closeModal = createStoreBooleanSetter(store => store.setShowCreateModal).setFalse;

/** “添加组件”弹窗 */
export function MaterialCreateModal() {
  return (
    <WithVoltronModalWithPortal>
      <InnerLayout>
        <FlexLayout>
          <UploadCoverField />
          <div
            style={{ gridTemplateColumns: '88px 1fr 24px 88px 1fr' }}
            className="grid grid-cols-5 gap-24 items-center"
          >
            <FormItem asFragment label="组件库" required className="justify-between gap-0">
              <FormFieldErrorWrapper className="col-span-4">
                <PackageNameInput placeholder="请选择" />
                <PackageNameErrorMessage />
              </FormFieldErrorWrapper>
            </FormItem>
            <FormItem asFragment label="组件名称" required className="justify-between gap-0 col-span-2">
              <FormFieldErrorWrapper className="col-span-4">
                <DisplayNameInput placeholder="请输入" />
                <DisplayNameErrorMessage />
              </FormFieldErrorWrapper>
            </FormItem>
            <FormItem asFragment label="组件调用名" required className="justify-between gap-0 col-span-2">
              <FormFieldErrorWrapper className="col-span-4">
                <CallingNameInput placeholder="请输入" />
                <CallingNameErrorMessage />
              </FormFieldErrorWrapper>
            </FormItem>
            <FormItem asFragment label="组件特性" className="justify-between flex-1">
              <FormFieldErrorWrapper className="col-span-2">
                <FeatureInput placeholder="请输入" />
                <FeatureErrorMessage />
              </FormFieldErrorWrapper>
            </FormItem>
            <FormItem asFragment label="是否图层组件" className="justify-between flex-1">
              <FormFieldErrorWrapper>
                <IsLayerInput placeholder="请选择" />
                <IsLayerErrorMessage />
              </FormFieldErrorWrapper>
            </FormItem>
          </div>
        </FlexLayout>
        <PropsForm />
        <AddPropsButton />
      </InnerLayout>
    </WithVoltronModalWithPortal>
  );
}

function FlexLayout({ children }: { children: React.ReactNode }) {
  return <div className="flex gap-24">{children}</div>;
}

function WithVoltronModalWithPortal({ children }: { children: React.ReactNode }) {
  const showCreateModal = useAdminPageStore(store => store.showCreateModal);

  if (!showCreateModal) {
    return null;
  }
  return (
    <VoltronModalWithPortal
      width={700}
      title="添加组件"
      cancelText="取消"
      okText="确认添加"
      onCancel={closeModal}
      onClose={closeModal}
      onOk={createMaterialData}
    >
      {children}
    </VoltronModalWithPortal>
  );
}

function InnerLayout({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-col gap-16 max-h-[76vh] overflow-y-auto">{children}</div>;
}

const PropsForm = createListComponentWithLength({
  componentName: 'PropsForm',
  useLength: () => useCreateMaterialFormData(() => getCreateMaterialFormModel().props.length),
  getList: () => getCreateMaterialFormModel().props,
  getKey: prop => prop.id.get(),
  renderItem: prop => (
    <UncontrolledFoldPanel
      title="属性配置"
      desc="(解释说明)"
      onRemove={() => {
        getCreateMaterialFormModel().props = getCreateMaterialFormModel().props.filter(
          prop => prop.id.get() !== prop.id.get()
        );
        notifyCreateMaterialFormUpdate();
      }}
      key={prop.id.get()}
    >
      <PropIdContext.Provider value={prop.id.get()}>
        <div className="px-12 flex flex-col gap-24 pt-12 pb-28">
          <JustifyBetweenLayout>
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
          </JustifyBetweenLayout>
          <JustifyBetweenLayout>
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
          </JustifyBetweenLayout>
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

function JustifyBetweenLayout({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-1 gap-24 justify-between">{children}</div>;
}

function AddPropsButton() {
  const [ref, scrollIntoView] = useScrollIntoView();
  const handleClick = () => {
    const [propModel] = createFormModel<MaterialPropsDTO>(notifyCreateMaterialFormUpdate, {
      id: nanoid(),
      propName: '',
      valueType: '',
      valueSource: '',
      category: '',
      displayName: '',
      defaultValue: '',
      templateKeyPathsReg: ''
    });
    getCreateMaterialFormModel().props.push(propModel);
    notifyCreateMaterialFormUpdate();
    window.requestAnimationFrame(scrollIntoView);
  };
  return (
    <div className="flex">
      <Button type="dashed" onClick={handleClick}>
        添加属性
      </Button>
      <div ref={ref as React.Ref<HTMLDivElement>} />
    </div>
  );
}
