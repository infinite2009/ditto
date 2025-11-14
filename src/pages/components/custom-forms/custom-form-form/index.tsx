import React, { useContext, useEffect, useRef, useState } from 'react';
import { Radio, Select, Switch } from 'antd';

import { observer } from 'mobx-react';
import { DSLStoreContext } from '@/hooks/context';
import { ExpandThin, Minus, PlusThin } from '@/components/icon';
import IComponentSchema from '@/types/component.schema';
import { ComponentId } from '@/types';

import { isEmpty } from '@/util';
import ComponentFeature from '@/types/component-feature';
import { SortableContext } from '@dnd-kit/sortable';
import SortableItem from '@/pages/components/sortable-item';
import { DndContext } from '@dnd-kit/core';
import { DragEndEvent } from '@dnd-kit/core/dist/types';
import FormInput from '@/pages/editor/form-panel/basic-form/form-input';

import customFormStyle from '../../index.module.less';
import VariableInput from '@/pages/components/variable-input';
import RulesSetting, { RulesSettingValue } from '@/pages/components/custom-forms/custom-form-form/rules-setting';
import IPropsSchema from '@/types/props.schema';

const ROW_SPAN_SIZE = 24;

export default observer(function CustomFormForm() {
  const dslStore = useContext(DSLStoreContext);

  const [showLabel, setShowLabel] = useState<boolean>(true);
  const [labelPosition, setLabelPosition] = useState<'horizontal' | 'vertical'>('horizontal');
  // const [columnSpanSize, setColumnSpanSize] = useState<number>(ROW_SPAN_SIZE);
  const [formItemSpan, setFormItemSpan] = useState<number[]>([]);
  const [colNum, setColNum] = useState<number>(4);

  const dependencyRef = useRef<string>(null);
  const fieldNamesRef = useRef<string[]>([]);
  const fieldLabelsDictRef = useRef<Record<string, string>>({});
  const formItemsRef = useRef<Record<string, IComponentSchema>>({});
  const rowRef = useRef<IComponentSchema>(null);
  const colDictRef = useRef<Record<string, IComponentSchema>>({});

  useEffect(() => {
    if (dslStore?.selectedComponent) {
      dependencyRef.current = dslStore?.selectedComponent.dependency;
      // 重置各种 ref
      fieldNamesRef.current = [];
      fieldLabelsDictRef.current = {};
      formItemsRef.current = {};
      rowRef.current = null;
      colDictRef.current = {};
      const propsDict = dslStore.dsl.props;
      if (dslStore?.selectedComponent?.children?.[0]) {
        const row = dslStore.fetchComponentInDSL(dslStore.selectedComponent.children[0].current);
        rowRef.current = row;
        // 初始化
        row.children?.forEach((col, index) => {
          const colComponent = dslStore.fetchComponentInDSL(col.current);
          const formItem = dslStore.fetchComponentInDSL(colComponent.children[0].current);
          fieldLabelsDictRef.current[formItem.id] = propsDict[formItem.id].label?.value as string;
          // 标题没有 name 属性
          fieldNamesRef.current.push(propsDict[formItem.id].name?.value as string);
          formItemsRef.current[formItem.id] = dslStore.fetchComponentInDSL(formItem.id);
          formItemSpan[index] = dslStore.fetchPropsSchema(col.current, 'span').value as number;
        });
        setFormItemSpan([...formItemSpan]);
        // const firstColumn = row.children?.[0];
        // if (firstColumn) {
        // const spanSize = dslStore.fetchPropsValue(firstColumn.current, 'span');
        // setColumnSpanSize(spanSize.value as number);
        // }
        const showLabel = row.children.some(item => {
          const col = dslStore.fetchComponentInDSL(item.current);
          const formItem = dslStore.fetchComponentInDSL(col.children[0].current);
          const value = dslStore.fetchPropsSchema(formItem.id, 'label')?.value;
          return value !== null && value !== '' && value !== undefined;
        });
        setShowLabel(showLabel);
      }
      setLabelPosition(dslStore.dsl.props[dslStore.selectedComponent.id]?.layout?.value as 'horizontal' | 'vertical');
    }
  }, [dslStore?.selectedComponent?.id]);

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

  // useEffect(() => {
  //   // adjustSpanForColumn();
  // }, [columnSpanSize]);

  // function adjustSpanForColumn() {
  //   const row = dslStore.fetchComponentInDSL(dslStore.selectedComponent.children?.[0]?.current);
  //   if (row) {
  //     const columnIds = row.children?.map(({ current }) => current);
  //     columnIds?.forEach(id => {
  //       dslStore.updateComponentProps({ span: columnSpanSize }, dslStore.fetchComponentInDSL(id));
  //     });
  //   }
  // }

  // function handleChangingFillMode(val: boolean) {
  //   setFillMode(val);
  // }

  function handleChangingLabelShowing(val: boolean) {
    setShowLabel(val);
  }

  function handleChangingLabelPosition(val: 'horizontal' | 'vertical') {
    setLabelPosition(val);
    if (dslStore.selectedComponent) {
      dslStore.updateComponentProps({ layout: val }, dslStore.selectedComponent);
    }
  }

  function handleChangingColNum(e) {
    const val = e.target.value;

    setColNum(val);
    if (dslStore.selectedComponent) {
      const { componentIndexes } = dslStore.dsl;

      const columns = rowRef.current.children.map(item => {
        return componentIndexes[item.current];
      });
      columns.forEach(column => {
        handleChangingColumnsPerRow(ROW_SPAN_SIZE / e.target.value, column);
      });
    }
  }

  function handleSelectComponent(data: string, component: IComponentSchema) {
    dslStore.replaceChild(component.id, 0, data, dependencyRef.current);
  }

  function removeCol(id: ComponentId) {
    dslStore.deleteComponent(id);
    delete colDictRef.current[id];
    const formItem = dslStore.fetchComponentInDSL(id).children[0];
    delete formItemsRef.current[formItem.current];
    // 如果表单项都删除了，删除 Row
    if (isEmpty(colDictRef.current)) {
      dslStore.deleteChild(dslStore.selectedComponent.id, 0);
    }
  }

  /**
   * 编辑表单项名称
   */
  function handleEditingFormItemName(val: string, index: number) {
    const form = dslStore.dsl.componentIndexes[dslStore.selectedComponent.id];
    const row = dslStore.fetchComponentInDSL(form.children[0].current);
    const column = dslStore.fetchComponentInDSL(row.children[index].current);
    const formItem = dslStore.fetchComponentInDSL(column.children[0].current);
    dslStore.updateComponentProps({ label: val.trim() }, formItem);
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
    const row = dslStore.fetchComponentInDSL(component.children[0].current);
    const columns = row.children.map(item => {
      return componentIndexes[item.current];
    });

    return (
      <SortableContext items={columns.map(item => item.id)}>
        {columns.map((col, index) => {
          const item = dslStore.fetchComponentInDSL(col.children[0].current);
          const { label } = dslStore.dsl.props[item.id];
          const childRef = item.children[0];
          return (
            <SortableItem key={col.id} id={col.id} footer={renderFormItemSetting(col, label, index)}>
              <div className={customFormStyle.draggableFromItem}>
                <div className={customFormStyle.header}>
                  <Select
                    value={childRef?.configName}
                    placeholder="请选择"
                    variant="borderless"
                    styles={{
                      popup: {
                        root: {
                          width: 140
                        }
                      }
                    }}
                    options={[
                      { value: 'Input', label: '普通输入框' },
                      { value: 'Input.TextArea', label: '多行文本框' },
                      { value: 'Input.Password', label: '密码输入框' },
                      { value: 'InputNumber', label: '数字输入框' },
                      { value: 'Select', label: '下拉选择器' },
                      { value: 'Cascader', label: '级联选择器' },
                      { value: 'DatePicker', label: '日期选择器' },
                      { value: 'RangePicker', label: '时间范围选择器' },
                      { value: 'Radio', label: '单选按钮' },
                      { value: 'Checkbox', label: '复选框' },
                      { value: 'Switch', label: '开关' },
                      { value: 'Text', label: '标题' },
                      { value: 'TreeSelect', label: '树选择器' }
                    ]}
                    onChange={e => handleSelectComponent(e, item)}
                    suffixIcon={<ExpandThin style={{ pointerEvents: 'none' }} />}
                  />
                  {index !== 0 && <Minus className={customFormStyle.removeIcon} onClick={() => removeCol(col.id)} />}
                </div>
              </div>
            </SortableItem>
          );
        })}
      </SortableContext>
    );
  }

  function addColumn() {
    if (isEmpty(formItemsRef.current)) {
      rowRef.current = dslStore.insertComponentWithConfig({
        parentId: dslStore.selectedComponent.id,
        name: 'Row',
        dependency: dependencyRef.current,
        autoSelect: false,
        feature: ComponentFeature.transparent
      });
      dslStore.updateComponentProps({ gutter: ROW_SPAN_SIZE }, rowRef.current);
    }

    const column = dslStore.insertComponentWithConfig({
      parentId: rowRef.current.id,
      name: 'Col',
      dependency: dependencyRef.current,
      autoSelect: false,
      feature: ComponentFeature.transparent
    });

    dslStore.updateComponentProps({ span: ROW_SPAN_SIZE / colNum }, column);

    colDictRef.current[column.id] = column;

    // 创建 form item
    const formItem = dslStore.insertComponentWithConfig({
      parentId: column.id,
      name: 'FormItem',
      dependency: dependencyRef.current,
      autoSelect: false,
      feature: ComponentFeature.transparent
    });

    formItemsRef.current[formItem.id] = formItem;
    // 更新它的 name
    const newFieldName = generateNewFieldName();
    const newLabelName = generateNewLabelName(formItem.id);
    const propsPartial: Record<string, any> = { name: newFieldName, style: { width: '100%' } };
    if (showLabel && newLabelName) {
      propsPartial.label = newLabelName;
    } else {
      propsPartial.label = undefined;
    }
    dslStore.updateComponentProps(propsPartial, formItem);
    if (formItem) {
      dslStore.insertComponentWithConfig({
        parentId: formItem.id,
        name: 'Input',
        dependency: dependencyRef.current,
        autoSelect: false
      });
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

  function handleChangingColumnsPerRow(data: number, col: IComponentSchema) {
    dslStore.updateComponentProps({ span: data }, col);
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

  function handleRules(data: Partial<RulesSettingValue>, index: number) {
    const formItem = fetchFormItem(index);
    dslStore.updateComponentProps({ rules: [{ ...data }] }, formItem);
  }

  function fetchFormItem(index: number) {
    const component = dslStore.selectedComponent;
    if (!component) {
      return null;
    }
    if (!component?.children) {
      return null;
    }
    const row = dslStore.fetchComponentInDSL(component.children[0].current);
    const column = dslStore.fetchComponentInDSL(row.children[index].current);
    return dslStore.fetchComponentInDSL(column.children[0].current);
  }

  function renderFormItemSetting(col: IComponentSchema, label: IPropsSchema, index: number) {
    const span = dslStore.fetchPropsSchema(col.id, 'span').value as number;
    const formItem = fetchFormItem(index);
    const { rules = [] } = dslStore.getComponentProps(formItem.id);
    const fieldComponent = dslStore.fetchComponentInDSL(formItem.children[0].current);
    let type = 'other';
    if (['Input', 'Input.TextArea', 'Text'].includes(fieldComponent.configName)) {
      type = 'string';
    } else if (fieldComponent.configName === 'InputNumber') {
      type = 'number';
    }
    const rulesValue = {
      ...(rules[0] || {}),
      type
    };
    return (
      <>
        {showLabel ? (
          <div className={customFormStyle.config}>
            <span className={customFormStyle.label}>表单项名</span>
            <FormInput value={label?.value as string} onChange={text => handleEditingFormItemName(text, index)} />
          </div>
        ) : null}
        <div className={customFormStyle.config}>
          <span className={customFormStyle.title}>宽度</span>
          <Radio.Group
            size="small"
            optionType="button"
            value={span}
            onChange={e => handleChangingColumnsPerRow(e.target.value, col)}
            options={[
              {
                value: 6,
                label: '一列'
              },
              {
                value: 12,
                label: '二列'
              },
              {
                value: 18,
                label: '三列'
              },
              {
                value: 24,
                label: '四列'
              }
            ]}
          />
        </div>
        <div className={customFormStyle.config}>
          <RulesSetting value={rulesValue} onChange={data => handleRules(data, index)} />
        </div>
      </>
    );
  }

  function renderLabelDisplay() {
    if (!dslStore?.selectedComponent?.children?.length) {
      return null;
    }
    return (
      <>
        <div className={customFormStyle.propsItem}>
          <span className={customFormStyle.title}>显示标签</span>
          <Switch checked={showLabel} onChange={handleChangingLabelShowing} />
        </div>
        <div className={customFormStyle.propsItem}>
          <span className={customFormStyle.title}>标签位置</span>
          <Select
            placeholder="请选择"
            value={labelPosition}
            onChange={handleChangingLabelPosition}
            options={[
              {
                value: 'vertical',
                label: '上方'
              },
              {
                value: 'horizontal',
                label: '左侧'
              }
            ]}
          />
        </div>
        <div className={customFormStyle.propsItem}>
          <span className={customFormStyle.title}>布局</span>
          <Radio.Group
            size="small"
            optionType="button"
            value={colNum}
            onChange={handleChangingColNum}
            options={[
              {
                value: 1,
                label: '一列'
              },
              {
                value: 2,
                label: '二列'
              },
              {
                value: 3,
                label: '三列'
              },
              {
                value: 4,
                label: '四列'
              }
            ]}
          />
        </div>
      </>
    );
  }

  function handleChangingVariableInput() {
    // TODO:
  }

  return (
    <div className={customFormStyle.form}>
      <div className={customFormStyle.propsItem}>
        <span className={customFormStyle.title}>初始值</span>
        <VariableInput value={{}} onChange={handleChangingVariableInput} />
      </div>
      {renderLabelDisplay()}
      <div className={customFormStyle.addItem}>
        <span className={customFormStyle.title}>表单项</span>
        <PlusThin className={customFormStyle.addIcon} onClick={addColumn} />
      </div>
      <DndContext onDragEnd={handleSortingFormItems}>
        <div className={customFormStyle.draggableForm}>{renderFormItems()}</div>
      </DndContext>
    </div>
  );
});
