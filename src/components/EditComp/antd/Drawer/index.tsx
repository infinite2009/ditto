/* eslint-disable react/display-name */
import { DSLStoreContext } from '@/hooks/context';
import { Drawer } from 'antd';
import { useContext } from 'react';
import EditableWrapper from '../../EditableWrapper';
export default ({ title, compid, ...restProps }) => {
  const dslStore = useContext(DSLStoreContext);
  const onOK = val => {
    dslStore.updateComponentProps(
      {
        title: val
      },
      {
        id: compid
      }
    );
  };

  return <Drawer title={<EditableWrapper onOK={onOK}>{title || '新建抽屉'}</EditableWrapper>} {...restProps}></Drawer>;
};
