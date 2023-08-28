import React, { CSSProperties } from 'react';
import { observer } from 'mobx-react-lite';
import DSLStore from '@/service/dsl-store';

export interface IDropAnchorProps {
  store: DSLStore;
}

export default observer(({ store }: IDropAnchorProps) => {
  const style: CSSProperties = {
    position: 'fixed',
    zIndex: 99,
    ...store.anchor,
    backgroundColor: '#f00'
  };
  return <div style={style} />;
});
