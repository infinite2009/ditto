import { DSLStoreContext } from '@/hooks/context';
import { useContext } from 'react';
import EditableWrapper from '../../EditableWrapper';
import { Button } from 'antd';

const Index = ({ children, compId, ...restProps }) => {
  const dslStore = useContext(DSLStoreContext);
  const onOK = val => {
    dslStore.updateComponentProps(
      {
        children: val
      },
      {
        id: compId
      }
    );
  };
  return (
    <Button {...restProps}>
      <EditableWrapper onOK={onOK}>{children[0] || ''}</EditableWrapper>
    </Button>
  );
};

Index.displayName = 'Button';

export default Index;
