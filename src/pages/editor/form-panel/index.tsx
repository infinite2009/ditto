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
import { fetchComponentConfig } from '@/util';
import { toJS } from 'mobx';

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
    }
    // {
    //   key: 'event',
    //   label: '事件',
    //   children: renderEventForm()
    // },
    // {
    //   key: 'data',
    //   label: '数据',
    //   children: renderDataForm()
    // }
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
    // 把样式配置转换为普通属性，并把需要转换的样式属性删除掉，避免重复传入属性导致组件出现超预期行为
    let transformedObj = {};
    const valueCopy = { ...value };
    if (dslStore.formConfigOfSelectedComponent?.transformerStr) {
      const transformer = new Function('values', dslStore.formConfigOfSelectedComponent.transformerStr);
      try {
        transformedObj = transformer(value);
        (dslStore.formConfigOfSelectedComponent?.valuesToIgnore || []).forEach(key => {
          delete valueCopy[key];
        });
      } catch (e) {
        console.error(e.toString());
      }
    }
    dslStore.updateComponentProps({
      style: {
        ...valueCopy
      },
      ...transformedObj
    });
  }

  function handleChangingDataFormValues(value: Record<string, any>) {
    dslStore.updateComponentProps(value);
  }

  function getBasicValue() {
    return {};
  }

  function renderStyleForm() {
    if (!dslStore.selectedComponent) {
      return <div>请选择一个组件</div>;
    }
    if (
      !(
        dslStore.formConfigOfSelectedComponent &&
        (dslStore.formConfigOfSelectedComponent?.formComponent?.style ||
          dslStore.formConfigOfSelectedComponent?.schema?.style)
      )
    ) {
      return <div>该组件暂不支持样式属性设置</div>;
    }

    const { configName, dependency, parentId, feature } = dslStore.selectedComponent;
    // 默认父组件的flexDirection 是 column
    let parentDirection: 'column' | 'row' = 'column';
    // PageRoot 没有 parentId
    if (parentId) {
      const parentSchema = dslStore.dsl.componentIndexes[parentId];
      if (parentSchema && parentSchema.feature === 'container') {
        parentDirection = dslStore.dsl.props[parentSchema.id].vertical.value ? 'column' : 'row';
      }
    }

    let mergedStyleObj: CSSProperties;
    const componentConfig = fetchComponentConfig(configName, dependency);

    if (componentConfig.transformerStr) {
      const transformer = new Function('values', componentConfig.transformerStr);
      let transformedValues = {};
      try {
        transformedValues = transformer(dslStore.valueOfSelectedComponent?.hidden);
      } catch (e) {
        console.error(e);
      }
      mergedStyleObj = {
        ...(dslStore.valueOfSelectedComponent?.style || {}),
        ...transformedValues
      };
    } else {
      mergedStyleObj = toJS(dslStore.valueOfSelectedComponent.style);
    }

    return (
      <StyleForm
        key="style"
        onChange={handleChangingStyleForm}
        value={mergedStyleObj}
        config={dslStore.formConfigOfSelectedComponent.schema?.style}
        parentDirection={parentDirection}
      />
    );
  }

  function renderBasicForm() {
    if (
      !(
        dslStore.formConfigOfSelectedComponent &&
        (dslStore.formConfigOfSelectedComponent.formComponent?.basic ||
          dslStore.formConfigOfSelectedComponent.schema?.basic)
      )
    ) {
      return <div>当前组件暂不支持基础属性设置</div>;
    }
    if (dslStore.formConfigOfSelectedComponent.formComponent?.basic) {
      const FormComponent = dslStore.formConfigOfSelectedComponent.formComponent.basic;
      return (
        <FormComponent value={dslStore.valueOfSelectedComponent?.basic} onChange={handleChangingBasicFormValues} />
      );
    }
    if (dslStore.formConfigOfSelectedComponent.schema?.basic) {
      return (
        <BasicForm
          key="basic"
          onChange={handleChangingBasicFormValues}
          value={dslStore.valueOfSelectedComponent?.basic}
          formSchema={dslStore.formConfigOfSelectedComponent.schema?.basic as unknown as FormSchema}
        />
      );
    }
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
    <div className={styles.main}>
      {dslStore.selectedComponent ? <Tabs className={styles.tab} items={tabsItems} /> : <div>请选择组件</div>}
    </div>
  );
});
