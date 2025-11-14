import { DSLStoreContext } from '@/hooks/context';
import { CollapseProps, Collapse } from '@bilibili/ui';
import { observer } from 'mobx-react';
import { useContext, useEffect } from 'react';
import { Form, Select } from 'antd';
import { toJS } from 'mobx';

const DEPENDENCY = '@bilibili/ui';

export default observer(function CustomEEApprove() {

  const dslStore = useContext(DSLStoreContext);

  const component = dslStore.selectedComponent;
  const { panelType, footerProps } = dslStore.dsl.props[component?.id] || [];

  const items: CollapseProps['items'] = [
    {
      key: '1',
      label: '侧面板配置',
      children: (
        <>
          <Form.Item label="面板类型" name="panelType">
            <Select
              options={[
                { label: 'versionPanel', value: 'version' },
                { label: 'approvalPanel', value: 'approval' },
                { label: '不展示', value: '' }
              ]}
            />
          </Form.Item>
        </>
      )
    },
    {
      key: '2',
      label: 'footer配置',
      children: (
        <>
          <Form.Item label="操作按钮" name={['footerProps', 'permissions']}>
            <Select
              mode="multiple"
              options={[
                { label: '加批', value: 'add' },
                { label: '抄送', value: 'cc' },
                { label: '废弃', value: 'terminate' },
                { label: '转办', value: 'transfer' },
                { label: '驳回', value: 'reject' },
                { label: '撤回', value: 'back' },
                { label: '通过', value: 'execute' },
                { label: '发起群聊', value: 'startChat' },
                { label: '暂挂', value: 'pend' },
                { label: '取消暂挂', value: 'cancelPend' }
              ]}
              allowClear
            />
          </Form.Item>
        </>
      )
    }
  ];

  const update = values => {
    if (values.footerProps) {
      dslStore.updateComponentProps({
        footerProps: {
          ...toJS(footerProps.value),
          ...values.footerProps
        }
      });
    } else {
      dslStore.updateComponentProps(values);
    }
  };

  return (
    <Form initialValues={{ panelType, footerProps: toJS(footerProps.value) }} onValuesChange={update}>
      <Collapse ghost size="small" items={items} defaultActiveKey={items.map(i => i.key)} />
    </Form>
  );
});
