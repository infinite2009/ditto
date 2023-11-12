import { Tabs } from 'antd';
import { CSSProperties, useContext, useEffect, useRef } from 'react';
import { loadFormLibrary } from '@/service/form';
import IFormConfig, { FormSchema } from '@/types/form-config';
import BasicForm from '@/pages/editor/form-panel/basic-form';
import EventForm from '@/pages/editor/form-panel/event-form';
import DataForm from '@/pages/editor/form-panel/data-form';
import StyleForm from '@/pages/editor/form-panel/style-form';
import { observer } from 'mobx-react';
import { DSLStoreContext } from '@/hooks/context';
import styles from './index.module.less';

export default observer(() => {
  const dslStore = useContext(DSLStoreContext);
  useRef<Record<string, IFormConfig>>();
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

  useEffect(() => {
    loadFormLibrary().then(res => {
      dslStore.initTotalFormConfig(res);
    });
  }, []);

  function handleChangingBasicFormValues(value: Record<string, any>) {
    dslStore.updateComponentProps(value);
  }

  function handleChangingEventFormValues(value: Record<string, any>) {
    dslStore.updateComponentProps(value);
  }

  function handleChangingStyleForm(value: CSSProperties) {
    dslStore.updateComponentProps(value);
  }

  function handleChangingDataFormValues(value: Record<string, any>) {
    dslStore.updateComponentProps(value);
  }

  function getBasicValue() {
    return {};
  }

  function renderStyleForm() {
    if (!dslStore.formConfigOfSelectedComponent) {
      return null;
    }
    return (
      <StyleForm
        key="style"
        onChange={handleChangingStyleForm}
        value={dslStore.valueOfSelectedComponent?.style}
        config={dslStore.formConfigOfSelectedComponent.schema?.style}
      />
    );
  }

  function renderBasicForm() {
    if (!dslStore.formConfigOfSelectedComponent) {
      return null;
    }
    if (dslStore.formConfigOfSelectedComponent.formComponent?.basic) {
      const FormComponent = dslStore.formConfigOfSelectedComponent.formComponent.basic;
      return <FormComponent value={getBasicValue()} onChange={handleChangingBasicFormValues} />;
    }
    return (
      <BasicForm
        key="basic"
        onChange={handleChangingBasicFormValues}
        value={dslStore.valueOfSelectedComponent?.style}
        formSchema={dslStore.formConfigOfSelectedComponent.schema?.basic as unknown as FormSchema}
      />
    );
  }

  function renderEventForm() {
    return (
      <EventForm
        key="event"
        onChange={handleChangingEventFormValues}
        value={dslStore.valueOfSelectedComponent?.event}
      />
    );
  }

  function renderDataForm() {
    return (
      <DataForm key="data" onChange={handleChangingDataFormValues} value={dslStore.valueOfSelectedComponent?.data} />
    );
  }

  return (
    <div className={styles.main}>{dslStore.selectedComponent ? <Tabs items={tabsItems} /> : <div>请选择组件</div>}</div>
  );
});
