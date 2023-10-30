import React, { CSSProperties, useContext } from 'react';
import { observer } from 'mobx-react';
import { DSLStoreContext } from '@/hooks/context';

export default observer(() => {
  const dslStore = useContext(DSLStoreContext);
  const style: CSSProperties = {
    position: 'fixed',
    zIndex: 99,
    ...dslStore.anchor,
    backgroundColor: '#f00'
  };
  return <div style={style} />;
});
