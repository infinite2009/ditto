import { Alert, Button, Tabs } from 'antd';
import classNames from 'classnames';
import { CSSProperties, Fragment, useContext, useEffect, useRef, useState } from 'react';
import { loadFormLibrary } from '@/service/form';
import IFormConfig, { FormSchema } from '@/types/form-config';
import BasicForm from '@/pages/editor/form-panel/basic-form';
import EventForm from '@/pages/editor/form-panel/event-form';
import StyleForm from '@/pages/editor/form-panel/style-form';
import { observer } from 'mobx-react';
import { DSLStoreContext, EditorStoreContext } from '@/hooks/context';
import styles from './index.module.less';
import { toJS } from 'mobx';
import ComponentManager from '@/service/component-manager';
import Unsupported from '@/pages/components/unsupported';
import IComponentSchema from '@/types/component.schema';
import { ComponentId } from '@/types';
import NoteConfig from '../note-config';
import { useSearchParams } from 'react-router-dom';
import { FormConfigType } from '@/service/editor-store';
import { DiffPropsFnResult } from '@/service/dsl-store';
import { useMutationObserver } from 'ahooks';
import { DevForm } from './dev-form';
import { ErrorBoundary } from 'react-error-boundary';

export default observer(() => {
  const breadcrumbRef = useRef<HTMLDivElement>(null);
  const [breadcrumb, setBreadcrumb] = useState<IComponentSchema[]>([]);
  const [componentPropsDiff, setComponentPropsDiff] = useState<DiffPropsFnResult>(null);
  const [searchParams] = useSearchParams();
  const editorStore = useContext(EditorStoreContext);
  const dslStore = useContext(DSLStoreContext);
  useRef<Record<string, IFormConfig>>();
  const tabsItems = [
    {
      key: 'basic',
      label: '基础',
      children: renderBasicForm()
    },
    {
      key: 'style',
      label: '样式',
      children: renderStyleForm()
    },
    {
      key: 'event',
      label: '事件',
      children: renderEventForm()
    },
    {
      key: 'note',
      label: '批注',
      children: renderComponentNote()
    },
    {
      key: 'dev',
      label: '开发',
      children: renderDevForm()
    }
  ];

  useEffect(() => {
    loadFormLibrary().then(res => {
      dslStore.initTotalFormConfig(res);
    });
    if (!dslStore.selectedComponent) {
      return;
    }
    dslStore.initComponentPropsViaNewConfig(dslStore.selectedComponent);
  }, []);

  function handleChangingBasicFormValues(value: Record<string, any>) {
    dslStore.updateComponentProps(value);
  }

  function handleReRenderComponent() {
    dslStore.forceUpdateComponent();
  }

  function handleChangingEventFormValues(value: Record<string, { action: string; eventTrackingInfo: string }>) {
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

    const { configName, dependency, parentId } = dslStore.selectedComponent;
    // 默认父组件的flexDirection 是 column
    let parentDirection: 'column' | 'row' = 'column';
    // PageRoot 没有 parentId
    if (parentId) {
      const parentSchema = dslStore.dsl.componentIndexes[parentId];
      if (parentSchema && parentSchema.feature === 'container') {
        parentDirection = (dslStore.dsl.props[parentSchema.id].style?.value as CSSProperties)?.flexDirection as
          | 'column'
          | 'row';
      }
    }

    let mergedStyleObj: CSSProperties;
    const componentConfig = ComponentManager.fetchComponentConfig(configName, dependency);

    if (componentConfig?.transformerStr) {
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
      mergedStyleObj = toJS(dslStore.valueOfSelectedComponent.style || {});
    }

    return (
      <ErrorBoundary fallback={<div>表单渲染错误</div>}>
        <StyleForm
          key={dslStore.selectedComponent?.id}
          onChange={handleChangingStyleForm}
          value={mergedStyleObj}
          config={dslStore.formConfigOfSelectedComponent.schema?.style}
          parentDirection={parentDirection}
        />
      </ErrorBoundary>
    );
  }

  function renderDevForm() {
    if (!dslStore.selectedComponent) {
      return <div>请选择一个组件</div>;
    }
    // updateComponentProps
    const props = dslStore.getComponentProps(dslStore.selectedComponent.id);
    return (
      <ErrorBoundary fallback={<div>表单渲染错误</div>}>
        <DevForm
          onAdd={(key: string) => {
            dslStore.addComponentPropsKey(key, undefined);
          }}
          onDelete={key => {
            dslStore.deleteComponentPropsKey(key);
          }}
          value={Object.entries(props).map(([key, value]) => ({ id: key, key, value }))}
          onChange={value => {
            dslStore.updateComponentProps(
              value.reduce((acc, cur) => {
                acc[cur.key] = cur.value;
                return acc;
              }, {})
            );
          }}
        />
      </ErrorBoundary>
    );
  }

  function renderBasicForm() {
    const curFormConfigOfSelected = dslStore.formConfigOfSelectedComponent;
    const customBasicSchema = curFormConfigOfSelected?.formComponent?.basic;
    const defaultBasicSchema = curFormConfigOfSelected?.schema?.basic;
    const showDivider = curFormConfigOfSelected?.divider?.basic;
    if (
      !(dslStore.formConfigOfSelectedComponent && (curFormConfigOfSelected?.formComponent?.basic || defaultBasicSchema))
    ) {
      return <Unsupported title="当前组件暂不支持基础属性设置"></Unsupported>;
    }
    const FormComponent = curFormConfigOfSelected?.formComponent?.basic;

    const formSchema = toJS(dslStore.formConfigOfSelectedComponent.schema?.basic) || {};

    Object.values(formSchema).forEach(item => {
      if (dslStore.dsl.props[dslStore.selectedComponent.id][item.name]?.valueSource === 'state') {
        item.componentProps = {
          options: Object.values(dslStore.dsl.variableDict).map(variable => {
            return {
              value: variable.key,
              label: variable.name
            };
          })
        };
      }
    });

    return (
      <ErrorBoundary fallback={<div>表单渲染错误</div>}>
        {defaultBasicSchema && (
          <BasicForm
            key="basic"
            onChange={handleChangingBasicFormValues}
            onReRender={handleReRenderComponent}
            value={dslStore.valueOfSelectedComponent?.basic}
            formSchema={formSchema as unknown as FormSchema}
            showDivider={showDivider}
          />
        )}
        {customBasicSchema && (
          <FormComponent value={dslStore.valueOfSelectedComponent?.basic} onChange={handleChangingBasicFormValues} />
        )}
      </ErrorBoundary>
    );
  }

  function renderEventForm() {
    const { event = {} } = dslStore.formConfigOfSelectedComponent?.schema || {};
    if (!Object.keys(event).length) {
      return <Unsupported title="该组件已有默认交互，暂不支持绑定其他事件" />;
    }
    const initialValue = {};
    Object.values(event).forEach(item => {
      const propSchema = dslStore.fetchPropsSchema(dslStore.selectedComponent.id, item.name);
      if (propSchema?.value) {
        initialValue[item.name] = propSchema.value;
      }
    });
    return (
      <ErrorBoundary fallback={<div>表单渲染错误</div>}>
        <EventForm
          key={dslStore.selectedComponent.id}
          event={event}
          initialValue={initialValue}
          onChange={handleChangingEventFormValues}
          actionList={dslStore.fetchActionList()}
        />
      </ErrorBoundary>
    );
  }

  function handleChangingTab(activeKey: FormConfigType) {
    editorStore.setPanelTabKey(activeKey);
  }

  function renderComponentNote() {
    return <NoteConfig pageId={dslStore.currentPageId} componentId={dslStore.selectedComponent?.id}></NoteConfig>;
  }

  /**
   * 切换选中组件
   */
  function handleSelectingComponent(componentId: ComponentId) {
    dslStore.selectComponent(componentId);
  }

  /**
   * 快捷组件层级面包屑
   */
  function renderBreadcrumb() {
    return (
      <div className={styles.breadcrumbContainer} ref={breadcrumbRef}>
        {breadcrumb?.map((componentSchema, i) => (
          <Fragment key={i}>
            <span
              className={classNames({
                [styles.breadcrumbItem]: true,
                [styles.active]: dslStore?.selectedComponent?.id === componentSchema.id
              })}
              onClick={() => handleSelectingComponent(componentSchema.id)}
            >
              {componentSchema.displayName || componentSchema.name}
            </span>
            {i !== breadcrumb?.length - 1 && <span className={styles.separator}>&gt;</span>}
          </Fragment>
        ))}
      </div>
    );
  }

  function renderDiff() {
    const add = componentPropsDiff.filter(i => i.type === 'add');
    const remove = componentPropsDiff.filter(i => i.type === 'remove');
    const update = componentPropsDiff.filter(i => i.type === 'update');
    return (
      <Alert
        style={{
          marginTop: 8,
          marginBottom: 8
        }}
        description={
          <>
            {!!add.length && (
              <div>
                新增：<b>{add.map(i => i.newProps.title).join('、')}</b>
              </div>
            )}
            {!!update.length && (
              <div>
                更新：<b>{update.map(i => i.newProps.title).join('、')}</b>
              </div>
            )}
            {!!remove.length && (
              <div>
                删除：<b>{remove.map(i => i.oldProps.title).join('、')}</b>
              </div>
            )}
          </>
        }
        action={
          !!componentPropsDiff && (
            <Button
              size="small"
              type="primary"
              ghost
              onClick={() => {
                dslStore.mergeComponentProps(dslStore?.selectedComponent?.id);
                setComponentPropsDiff(null);
              }}
            >
              更新组件配置
            </Button>
          )
        }
        type="warning"
        showIcon={false}
        closable
      />
    );
  }

  useEffect(() => {
    const curId = dslStore?.selectedComponent?.id;
    if (!curId) {
      return;
    }
    const curSelectedComponentPathList = dslStore?.findAllParentsIdViaComponentId(curId);
    const diff = dslStore.diffComponentProps(curId);
    setComponentPropsDiff(diff);
    setBreadcrumb(curSelectedComponentPathList.concat([dslStore?.selectedComponent]));
  }, [dslStore?.selectedComponent]);

  useMutationObserver(
    () => {
      breadcrumbRef.current.scrollTo({
        left: breadcrumbRef.current.scrollWidth - breadcrumbRef.current.clientWidth,
        top: 0,
        behavior: 'auto'
      });
    },
    breadcrumbRef,
    {
      subtree: true,
      childList: true
    }
  );

  (window as any).dsl = toJS(dslStore.dsl);
  (window as any).toJS = toJS;

  return (
    <div className={styles.formPanel}>
      {renderBreadcrumb()}
      {dslStore.selectedComponent ? (
        <>
          {componentPropsDiff && renderDiff()}
          <Tabs
            className={styles.tab}
            items={tabsItems}
            activeKey={editorStore.panelTabKey}
            onChange={handleChangingTab}
          />
        </>
      ) : (
        <div>请选择组件</div>
      )}
    </div>
  );
});
