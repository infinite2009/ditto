import { DSLStoreContext } from '@/hooks/context';
import { Typography } from '@bilibili/ui';
import { useContext } from 'react';
import EditableWrapper from '../../EditableWrapper';
export default ({compid, ...restProps }) => {
  const dslStore = useContext(DSLStoreContext);
  const onOK = val => {
    dslStore.updateComponentProps({
      children: val
    }, {id: compid});

  };
  return (
    <EditableWrapper onOK={onOK}>
      <Typography.Text {...restProps} />
    </EditableWrapper>
  );
};
