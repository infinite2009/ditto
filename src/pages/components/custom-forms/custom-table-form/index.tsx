import { useContext, useEffect, useRef } from 'react';

import { DSLStoreContext } from '@/hooks/context';
import { observer } from 'mobx-react';

export default observer(function CustomTableForm() {
  const dslStore = useContext(DSLStoreContext);

  const fieldNamesRef = useRef<string[]>([]);
  const fieldLabelsRef = useRef<string[]>([]);

  useEffect(() => {
    if (dslStore?.selectedComponent) {
      const propsDict = dslStore.dsl.props;
      dslStore.selectedComponent.children?.forEach(item => {
        fieldLabelsRef.current.push(propsDict[item.current].label.value as string);
        fieldNamesRef.current.push(propsDict[item.current].name.value as string);
      });
    }
  }, []);

  function generateDefaultColumn() {
    return {
      title: '默认字段',
      defaultValue: '',
      componentName: 'Input',
      useSort: false,
      useFilter: false
    };
  }

  return <div></div>;
});
