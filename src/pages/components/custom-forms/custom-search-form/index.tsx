import React, { useContext, useEffect, useRef, useState } from 'react';
import { Select, Switch } from 'antd';

import { observer } from 'mobx-react';
import { DSLStoreContext } from '@/hooks/context';
import { ExpandThin, Minus, PlusThin } from '@/components/icon';
import IComponentSchema from '@/types/component.schema';
import { ComponentId } from '@/types';
import ComponentFeature from '@/types/component-feature';
import { SortableContext } from '@dnd-kit/sortable';
import SortableItem from '@/pages/components/sortable-item';
import { DndContext } from '@dnd-kit/core';
import { DragEndEvent } from '@dnd-kit/core/dist/types';
import FormInput from '@/pages/editor/form-panel/basic-form/form-input';

import customFormStyle from '../../index.module.less';

function CustomFormForm() {
  const [showLabel, setShowLabel] = useState<boolean>(true);

  const dslStore = useContext(DSLStoreContext);

  const fieldNamesRef = useRef<string[]>([]);
  const fieldLabelsDictRef = useRef<Record<string, string>>({});
  const formItemsRef = useRef<Record<string, IComponentSchema>>({});
  const colDictRef = useRef<Record<string, IComponentSchema>>({});
  const dependencyRef = useRef<string>(null);

  useEffect(() => {
    if (dslStore?.selectedComponent) {
      dependencyRef.current = 'antd';
      const propsDict = dslStore.dsl.props;
      const component = dslStore.selectedComponent;
      const items = dslStore.fetchComponentInDSL(component.id).children || [];
      if (items.length) {
        // 初始化
        items?.forEach((col) => {
          const formItem = dslStore.fetchComponentInDSL(col.current);
          fieldLabelsDictRef.current[formItem.id] = propsDict[formItem.id].label?.value as string;
          // 标题没有 name 属性
          fieldNamesRef.current.push(propsDict[formItem.id].name?.value as string);
          formItemsRef.current[formItem.id] = dslStore.fetchComponentInDSL(formItem.id);
        });
        const showLabel = items.some(item => {
          const formItem = dslStore.fetchComponentInDSL(item.current);
          const value = dslStore.fetchPropsSchema(formItem.id, 'label')?.value;
          return value !== null && value !== '' && value !== undefined;
        });
        setShowLabel(showLabel);
      }
    }
  }, []);

  useEffect(() => {
    for (const id in formItemsRef.current) {
      const component = dslStore.fetchComponentInDSL(id);
      if (component) {
        if (showLabel) {
          dslStore.updateComponentProps({ label: fieldLabelsDictRef.current[id] }, component);
        } else {
          dslStore.updateComponentProps({ label: undefined }, component);
        }
      }
    }
  }, [showLabel]);

  function handleSelectComponent(data: string, component: IComponentSchema) {
    if (data === 'Text') {
      const col = dslStore.fetchParentComponentInDSL(component.id);
      dslStore.replaceChild(col.id, 0, data, dependencyRef.current);
    } else {
      if (component.configName === 'Text') {
        const col = dslStore.fetchComponentInDSL(component.parentId);
        const formItem = dslStore.replaceChild(col.id, 0, 'FormItem', dependencyRef.current);
        dslStore.insertComponentWithConfig({
          parentId: formItem.id,
          name: data,
          dependency: dependencyRef.current,
          autoSelect: false
        });
      } else {
        dslStore.replaceChild(component.id, 0, data, dependencyRef.current);
      }
    }
  }

  function removeFormItem(id: ComponentId) {
    dslStore.deleteComponent(id);
    delete colDictRef.current[id];

    delete formItemsRef.current[id];
  }

  /**
   * 编辑表单项名称
   */
  function handleEditingFormItemName(val: string, index: number) {
    const form = dslStore.dsl.componentIndexes[dslStore.selectedComponent.id];
    const formItem = dslStore.fetchComponentInDSL(form.children[index].current);
    const field = dslStore.fetchComponentInDSL(formItem.children[0].current);

    dslStore.updateComponentProps({ label: val.trim() }, formItem);
    dslStore.updateComponentProps({ title: val.trim(), isFillMode: true }, field);
    fieldLabelsDictRef.current[formItem.id] = val.trim();
  }

  function renderFormItems() {
    const component = dslStore.selectedComponent;
    if (!component) {
      return null;
    }
    const { componentIndexes } = dslStore.dsl;
    if (!component?.children) {
      return null;
    }

    const items = dslStore.fetchComponentInDSL(component.id).children || [];
    const componentsList = items.map(item => {
      return componentIndexes[item.current];
    });

    return (
      <SortableContext items={componentsList.map(item => item.id)}>
        {componentsList.map((col, index) => {
          const childRef = dslStore.fetchComponentInDSL(col.id).children[0];
          const { label } = dslStore.dsl.props[col.id];

          return (
            <SortableItem key={col.id} id={col.id} footer={renderFormItemSetting(label, index)}>
              <div className={customFormStyle.draggableFromItem}>
                <div className={customFormStyle.header}>
                  <Select
                    value={childRef?.configName}
                    placeholder="请选择"
                    variant="borderless"
                    styles={{
                      popup: {
                        root: { width: 140 }
                      }
                    }}
                    options={[
                      { value: 'Input', label: '普通输入框' },
                      // { value: 'Input.TextArea', label: '多行文本框' },
                      // { value: 'Input.Password', label: '密码输入框' },
                      { value: 'InputNumber', label: '数字输入框' },
                      { value: 'Select', label: '下拉选择器' },
                      { value: 'Cascader', label: '级联选择器' },
                      { value: 'DatePicker', label: '日期选择器' },
                      { value: 'RangePicker', label: '时间范围选择器' },
                      // { value: 'Radio', label: '单选按钮' },
                      // { value: 'Checkbox', label: '复选框' },
                      // { value: 'Switch', label: '开关' },
                      // { value: 'Text', label: '标题' },
                      { value: 'TreeSelect', label: '树选择器' }
                    ]}
                    onChange={e => handleSelectComponent(e, col)}
                    suffixIcon={<ExpandThin style={{ pointerEvents: 'none' }} />}
                  />
                  <Minus className={customFormStyle.removeIcon} onClick={() => removeFormItem(col.id)} />
                </div>
              </div>
            </SortableItem>
          );
        })}
      </SortableContext>
    );
  }

  function addFormItem() {
    // 创建 form item
    const formItem = dslStore.insertComponentWithConfig({
      parentId: dslStore.selectedComponent.id,
      name: 'FormItem',
      dependency: dependencyRef.current,
      autoSelect: false,
      feature: ComponentFeature.transparent
    });

    formItemsRef.current[formItem.id] = formItem;
    // 更新它的 name
    const newFieldName = generateNewFieldName();
    const newLabelName = generateNewLabelName(formItem.id);
    const propsPartial: Record<string, any> = { name: newFieldName };
    if (newLabelName) {
      propsPartial.label = newLabelName;
    } else {
      propsPartial.label = undefined;
    }
    dslStore.updateComponentProps(propsPartial, formItem);
    if (formItem) {
      const field = dslStore.insertComponentWithConfig({
        parentId: formItem.id,
        name: 'Input',
        dependency: dependencyRef.current,
        autoSelect: false
      });
      dslStore.updateComponentProps({ isFillMode: true, title: newLabelName }, field);
    }
  }

  function generateNewFieldName() {
    let nameSuffix = 1;
    const namePrefix = 'name';
    let nameExists = fieldNamesRef.current.some(item => item === `${namePrefix}${nameSuffix}`);
    while (nameExists) {
      nameSuffix++;
      nameExists = fieldNamesRef.current.some(item => item === `${namePrefix}${nameSuffix}`);
    }
    const newFieldName = `${namePrefix}${nameSuffix}`;
    fieldNamesRef.current.push(newFieldName);
    return newFieldName;
  }

  function generateNewLabelName(id: ComponentId) {
    let labelSuffix = 1;
    const labelPrefix = '字段';
    const labels = Object.values(fieldLabelsDictRef.current);
    let nameExists = labels.some(item => item === `${labelPrefix}${labelSuffix}`);
    while (nameExists) {
      labelSuffix++;
      nameExists = labels.some(item => item === `${labelPrefix}${labelSuffix}`);
    }
    const newLabelName = `${labelPrefix}${labelSuffix}`;
    fieldLabelsDictRef.current[id] = newLabelName;
    return newLabelName;
  }
  function handleSortingFormItems(e: DragEndEvent) {
    const { over, active } = e;
    if (over.id === active.id) {
      return;
    }
    const activeIndex = dslStore.findIndex(active.id as string);
    const overIndex = dslStore.findIndex(over.id as string);
    const insertIndex = activeIndex > overIndex ? overIndex : overIndex + 1;
    dslStore.moveComponent(
      dslStore.fetchComponentInDSL(active.id as string).parentId,
      active.id as string,
      insertIndex
    );
  }

  function renderFormItemSetting(label, index) {
    return (
      <div className={customFormStyle.config}>
        <span className={customFormStyle.label}>表单项名</span>
        <FormInput value={label?.value as string} onChange={text => handleEditingFormItemName(text, index)} />
      </div>
    );
  }

  function handleChangingLabelShowing(val: boolean) {
    setShowLabel(val);
  }

  return (
    <div className={customFormStyle.form}>
      <div className={customFormStyle.addItem}>
        <span className={customFormStyle.title}>字段标题显示</span>
        <Switch checked={showLabel} onChange={handleChangingLabelShowing} />
      </div>
      <div className={customFormStyle.addItem}>
        <span className={customFormStyle.title}>表单项</span>
        <PlusThin className={customFormStyle.addIcon} onClick={addFormItem} />
      </div>
      <DndContext onDragEnd={handleSortingFormItems}>
        <div className={customFormStyle.draggableForm}>{renderFormItems()}</div>
      </DndContext>
    </div>
  );
};

CustomFormForm.displayName = 'CustomFormForm';

const Index = observer(CustomFormForm)

export default Index;
