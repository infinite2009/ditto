import React, { useContext } from 'react';

import { DSLStoreContext } from '@/hooks/context';
import { observer } from 'mobx-react';
import { Form } from 'antd';
import { useForm } from 'antd/es/form/Form';
import DraggableTree from '../../draggable-tree';
import { cloneDeep } from 'lodash';

export const TreeForm = observer(function CustomTreeForm(props: { fieldNames?: { title?: string; key?: string } }) {
  const [form] = useForm();

  const dslStore = useContext(DSLStoreContext);

  const component = dslStore.selectedComponent;
  const { treeData } = dslStore.dsl.props[component?.id];
  const value = cloneDeep(treeData.value || []);
  const update = values => {
    dslStore.updateComponentProps({ ...values });
  };

  return (
    <Form
      layout="vertical"
      form={form}
      initialValues={{
        treeData: value
      }}
      onValuesChange={update}
    >
      <Form.Item name={treeData.name} label={treeData.title}>
        <DraggableTree fieldNames={props.fieldNames} />
      </Form.Item>
    </Form>
  );
});

const CustomTreeForm = (type: 'tree' | 'treeSelect') => {
  if (type === 'tree') {
    // eslint-disable-next-line react/display-name
    return () => <TreeForm fieldNames={{ title: 'title', key: 'key' }} />;
  }
  // eslint-disable-next-line react/display-name
  return () => <TreeForm fieldNames={{ title: 'title', key: 'value' }} />;
};

export default CustomTreeForm;
