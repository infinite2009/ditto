/* eslint-disable react/display-name */
import { DSLStoreContext } from '@/hooks/context';
import { Button } from '@bilibili/ui';
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
  return <Button {...restProps} >
    <EditableWrapper onOK={onOK}>{children[0] || ''}</EditableWrapper>
  </Button>;
};
