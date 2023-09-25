import { Tabs } from 'antd';
import styles from './index.module.less';
import { CSSProperties, FC, useContext, useEffect, useRef, useState } from 'react';
import { loadFormLibrary } from '@/service/form';
import IFormConfig, { FormSchema } from '@/types/form-config';
import BasicForm from '@/pages/editor/form-panel/basic-form';
import EventForm from '@/pages/editor/form-panel/event-form';
import DataForm from '@/pages/editor/form-panel/data-form';
import StyleForm from '@/pages/editor/form-panel/style-form';
import { observer } from 'mobx-react-lite';
import { DSLStoreContext } from '@/hooks/context';

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

export default observer(() => {
  const dslStore = useContext(DSLStoreContext);

  const formConfigRef = useRef<Record<string, IFormConfig>>();

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

  const formConfig: IFormConfig | null = getFormConfig();

  function getFormConfig() {
    if (!formConfigRef.current) {
      return null;
    }
    if (!dslStore.selectedComponent) {
      return null;
    }
    const { configName, name } = dslStore.selectedComponent;
    return formConfigRef.current[configName || name];
  }

  useEffect(() => {
    loadFormLibrary().then(res => {
      formConfigRef.current = res;
    });
  }, []);

  function propsValueOfSelectedComponent() {
    const { selectedComponent } = dslStore;
    if (selectedComponent) {
      const { propsRefs } = selectedComponent;
      const value: Record<string, any> = {};
      propsRefs.forEach(ref => {
        const prop = dslStore.dsl.props[selectedComponent.id][ref];
        value[ref] = prop.value;
      });
      return value;
    }
  }

  function handleChangingBasicFormValues(value: Record<string, any>) {
    dslStore.updateComponentProps(value);
  }

  function handleChangingEventFormValues(value: Record<string, any>) {
    dslStore.updateComponentProps(value);
  }

  function handleChangingStyleForm(value: CSSProperties) {
    dslStore.updateComponentProps({ style: value });
  }

  function handleChangingDataFormValues(value: Record<string, any>) {
    dslStore.updateComponentProps(value);
  }

  function getBasicValue() {
    return {};
  }

  function getStyleValue() {
    return {};
  }

  function getEventValue() {
    // TODO: 从 actions 里边取
    return {};
  }

  function getDataValue() {
    return {};
  }

  function renderStyleForm() {
    if (!formConfig) {
      return null;
    }
    return (
      <StyleForm
        key="style"
        onChange={handleChangingStyleForm}
        value={getStyleValue()}
        config={formConfig.schema?.style}
      />
    );
  }

  function renderBasicForm() {
    if (!formConfig) {
      return null;
    }
    if (formConfig.formComponent?.basic) {
      const FormComponent = formConfig.formComponent.basic;
      return <FormComponent value={getBasicValue()} onChange={handleChangingBasicFormValues} />;
    }
    return (
      <BasicForm
        key="basic"
        onChange={handleChangingBasicFormValues}
        value={getStyleValue()}
        formSchema={formConfig.schema?.basic as unknown as FormSchema}
      />
    );
  }

  function renderEventForm() {
    return <EventForm key="event" onChange={handleChangingEventFormValues} value={getEventValue()} />;
  }

  function renderDataForm() {
    return <DataForm key="data" onChange={handleChangingDataFormValues} value={getDataValue()} />;
  }

  return (
    <div className={styles.main}>
      <Tabs items={tabsItems} />
    </div>
  );
});
