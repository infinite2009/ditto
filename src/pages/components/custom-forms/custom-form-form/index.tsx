import { Minus, PlusThin } from '@/components/icon';
import style from './index.module.less';
import { observer } from 'mobx-react';
import { useContext } from 'react';
import { DSLStoreContext } from '@/hooks/context';
import { Select, Typography } from 'antd';

export default observer(function CustomFormForm() {
  const dslStore = useContext(DSLStoreContext);
  function removeFormItem() {}

  function renderFormItems() {
    const component = dslStore.selectedComponent;
    if (!component) {
      return null;
    }
    const { componentIndexes } = dslStore.dsl;
    if (!component?.children) {
      return null;
    }
    const formItems = component.children.map(item => {
      return componentIndexes[item.current];
    });
    return formItems.map(item => {
      const { name, label } = dslStore.dsl.props[item.id];
      const childRef = item.children[0];
      const childComponent = componentIndexes[childRef.current];
      return (
        <div className={style.draggableFromItem} key={name.id}>
          <div className={style.header}>
            <span>*</span>
            <Select value={childComponent.configName} placeholder="请选择">
              <Select.Option value="Input">普通输入框</Select.Option>
              <Select.Option value="PasswordInput">密码输入框</Select.Option>
              <Select.Option value="Select">下拉选择器</Select.Option>
              <Select.Option value="Cascade">级联选择器</Select.Option>
              <Select.Option value="Datepicker">时间选择器</Select.Option>
              <Select.Option value="RangePicker">时间范围选择器</Select.Option>
              <Select.Option>单选按钮</Select.Option>
              <Select.Option>复选框</Select.Option>
              <Select.Option>开关</Select.Option>
            </Select>
          </div>
          <div className={style.title}>
            <span>提示词</span>
            <Typography.Text>{name.value as string}</Typography.Text>
          </div>
        </div>
      );
    });
  }

  function addFormItem() {
    // 创建 form item
    const formItem = dslStore.insertComponent(dslStore.selectedComponent.id, 'FormItem', 'antd');
    if (formItem) {
      dslStore.insertComponent(formItem.id, 'Input', 'antd');
    }
  }

  return (
    <div className={style.form}>
      <div className={style.addItem}>
        <span className={style.title}>表单项</span>
        <PlusThin className={style.addIcon} onClick={addFormItem} />
        {/*<Minus className={style.removeIcon} onClick={removeFormItem} />*/}
      </div>
      <div className={style.draggableForm}>{renderFormItems()}</div>
    </div>
  );
});
