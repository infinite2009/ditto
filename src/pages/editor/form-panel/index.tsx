import { Tabs } from 'antd';
import styles from './index.module.less';
import { CSSProperties, FC, useEffect, useRef } from 'react';
import { loadFormLibrary } from '@/service/form';
import IFormConfig, { FormSchema } from '@/types/form-config';
import BasicForm from '@/pages/editor/form-panel/basic-form';
import EventForm from '@/pages/editor/form-panel/event-form';
import DataForm from '@/pages/editor/form-panel/data-form';
import StyleForm from '@/pages/editor/form-panel/style-form';

export interface FormValue {
  style: CSSProperties;
  basic: Record<string, any>;
  event: Record<string, any>;
  data: Record<string, any>;
}

export interface IFormPanelProps {
  formConfig: IFormConfig;
  value?: Partial<FormValue>;
  onChange: (value: Partial<FormValue>) => void;
}

export default function FormPanel({ value = {}, onChange, formConfig }: IFormPanelProps) {
  const tabsItems = [
    {
      key: 'style',
      label: '样式',
      children: renderStyleForm()
    },
    {
      key: 'basic',
      label: '基础',
      children: renderBasicForm()
    },
    {
      key: 'event',
      label: '事件',
      children: renderEventForm()
    },
    {
      key: 'data',
      label: '数据',
      children: renderDataForm()
    }
  ];

  function handleChangingBasicFormValues(value: Record<string, any>) {
    if (onChange) {
      onChange({
        basic: value
      });
    }
  }

  function handleChangingEventFormValues(value: Record<string, any>) {
    if (onChange) {
      onChange({
        event: value
      });
    }
  }

  function handleChangingStyleForm(value: CSSProperties) {
    if (onChange) {
      onChange({
        style: value
      });
    }
  }

  function handleChangingDataFormValues(value: Record<string, any>) {
    if (onChange) {
      onChange({
        data: value
      });
    }
  }

  function renderStyleForm() {
    return (
      <StyleForm key="style" onChange={handleChangingStyleForm} value={value.style} config={formConfig.schema?.style} />
    );
  }

  function renderBasicForm() {
    if (formConfig.formComponent?.basic) {
      const FormComponent = formConfig.formComponent.basic;
      return <FormComponent value={value.basic} onChange={handleChangingBasicFormValues} />;
    }
    return (
      <BasicForm
        key="basic"
        onChange={handleChangingBasicFormValues}
        value={value.basic}
        formSchema={formConfig.schema?.basic as unknown as FormSchema}
      />
    );
  }

  function renderEventForm() {
    return <EventForm key="event" onChange={handleChangingEventFormValues} value={value.event} />;
  }

  function renderDataForm() {
    return <DataForm key="data" onChange={handleChangingDataFormValues} value={value.data} />;
  }

  return (
    <div className={styles.main}>
      <Tabs items={tabsItems} />
    </div>
  );
}
