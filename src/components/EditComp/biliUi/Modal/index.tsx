/* eslint-disable react/display-name */
import { DSLStoreContext } from '@/hooks/context';
import { Modal } from '@bilibili/ui';
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

  return <Modal title={<EditableWrapper onOK={onOK}>{title || '新建弹框'}</EditableWrapper>} {...restProps}></Modal>;
};
