/* eslint-disable react/display-name */
import { DSLStoreContext } from '@/hooks/context';
import { Tag } from '@bilibili/ui';
import { useContext } from 'react';
import EditableWrapper from '../../EditableWrapper';
export default ({ children,compid, ...restProps }) => {
  const dslStore = useContext(DSLStoreContext);
  const onOK = val => {
    dslStore.updateComponentProps({
      children: val
    }, {
      id: compid,
    });
  };
  return <Tag {...restProps} >
    <EditableWrapper onOK={onOK}>{children || ''}</EditableWrapper>
  </Tag>;
};
