import { Tabs } from 'antd';
import styles from './index.module.less';
import { CSSProperties, useEffect, useRef } from 'react';
import { loadFormLibrary } from '@/service/form';
import IFormConfig from '@/types/form-config';
import StyleForm from 'style-form';
import BasicForm from '@/pages/editor/form-panel/basic-form';
import EventForm from '@/pages/editor/form-panel/event-form';
import DataForm from '@/pages/editor/form-panel/data-form';

export interface IFormConfigProps {
  componentConfigName: string;
}

export default function FormPanel({ componentConfigName }: IFormConfigProps) {
  const formConfigRef = useRef<Record<string, IFormConfig>>();

  useEffect(() => {
    loadFormLibrary().then(res => {
      formConfigRef.current = res;
    });
    console.log('form panel loaded successfully');
  }, []);

  useEffect(() => {
    if (componentConfigName) {
    }
    console.log('component config name changed');
  }, [componentConfigName]);

  function renderStyleForm() {
    return <StyleForm key="style" onChange={handleChangingStyleForm} value={{}} />;
  }

  function renderBasicForm() {
    return <BasicForm key="basic" onChange={handleChangingBasicFormValues} value={{}} />;
  }

  function renderEventForm() {
    return <EventForm key="event" onChange={handleChangingEventFormValues} value={{}} />;
  }

  function renderDataForm() {
    return <DataForm key="data" onChange={handleChangingDataFormValues} value={{}} />;
  }

  function handleChangingBasicFormValues(value: Record<string, any>) {}

  function handleChangingEventFormValues(value: Record<string, any>) {}

  function handleChangingStyleForm(value: CSSProperties) {}

  function handleChangingDataFormValues(value: Record<string, any>) {}

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

  return (
    <div className={styles.main}>
      <Tabs items={tabsItems} />
    </div>
  );
}
