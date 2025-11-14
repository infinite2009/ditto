import { DSLStoreContext } from '@/hooks/context';
import { Form } from '@bilibili/ui';
import { useContext } from 'react';
import EditableWrapper from '../../EditableWrapper';
// eslint-disable-next-line react/display-name
export default ({ label, compid, ...restProps }) => {
  const dslStore = useContext(DSLStoreContext);
  const onOK = val => {
    dslStore.updateComponentProps(
      {
        label: val
      },
      {
        id: compid
      }
    );
  };

  return <Form.Item label={<EditableWrapper onOK={onOK}>{label || ''}</EditableWrapper>} {...restProps}></Form.Item>;
};
