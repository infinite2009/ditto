import { DSLStoreContext } from '@/hooks/context';
import { Divider, Popconfirm, Select, Space, Typography } from 'antd';
import { useContext, useState } from 'react';
import { DeleteOutlined, HighlightOutlined, PlusOutlined } from '@ant-design/icons';
import EditForm from './editForm';
import { observer } from 'mobx-react';

const ISelect = observer(({ options, ...restProps }) => {
  const [editing, setEditing] = useState(undefined);

  const dslStore = useContext(DSLStoreContext);

  const componentId = dslStore.selectedComponent?.id;

  const addItem = newData => {
    dslStore.updateComponentProps(
      {
        options: [...options, newData]
      },
      { id: componentId }
    );
  };

  const deleteItem = idx => {
    const newData = options.toSpliced(idx, 1);
    dslStore.updateComponentProps({ options: newData }, { id: componentId });
  };

  const updateItem = (newVal, idx) => {
    const newData = options.toSpliced(idx, 1, newVal);
    dslStore.updateComponentProps({ options: newData }, { id: componentId });
  };

  const onClick = () => {
    setEditing(prev => setEditing(!prev));
  };

  return (
    <>
      <Select
        style={{ width: 200 }}
        {...restProps}
        options={options}
        open={editing}
        optionRender={(option, info) => {
          return (
            <div style={{ display: 'flex' }}>
              <Typography.Text style={{ flex: 1 }} ellipsis={{ tooltip: option.label }}>
                {option.label}
              </Typography.Text>
              <div>
                <EditForm
                  title="修改选项"
                  onOK={value => updateItem(value, info.index)}
                  formInitData={{ label: option.label, value: option.value }}
                  actionIcon={<HighlightOutlined />}
                />
                <Popconfirm title="删除确认" description="确定要删除选项吗" onConfirm={() => deleteItem(info.index)}>
                  <DeleteOutlined style={{ paddingLeft: 4 }} onClick={onClick} />
                </Popconfirm>
              </div>
            </div>
          );
        }}
        onClick={onClick}
        dropdownRender={menu => (
          <>
            {menu}
            <Divider style={{ margin: '8px 0' }} />
            <Space style={{ padding: '0 8px 4px' }}>
              <EditForm onOK={value => addItem(value)} actionIcon={<PlusOutlined />} />
            </Space>
          </>
        )}
      />
    </>
  );
});

export default ISelect;
