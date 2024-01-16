import { ComponentId } from '@/types';
import { Tree } from 'antd';
import React, { Key, useContext } from 'react';
import { DSLStoreContext } from '@/hooks/context';
import { observer } from 'mobx-react';
import { Expand } from '@/components/icon';

export interface IComponentTreeProps {
  data: any[];
  onSelect: (componentId: ComponentId) => void;
  onCancelSelect: (componentId: ComponentId) => void;
}

export default observer(function ComponentTree({ data, onSelect, onCancelSelect }: IComponentTreeProps) {
  const dslStore = useContext(DSLStoreContext);

  function handleSelectingComponent(selectedKeys: Key[], e: { selected: boolean; node: any }) {
    if (selectedKeys.length) {
      if (onSelect) {
        onSelect(selectedKeys[0] as ComponentId);
      }
    } else {
      debugger;
      if (onCancelSelect && e.selected) {
        onCancelSelect(e.node.id);
      }
    }
  }

  return (
    <Tree
      switcherIcon={<Expand />}
      selectedKeys={[dslStore.selectedComponent?.id]}
      treeData={data}
      onSelect={handleSelectingComponent}
    />
  );
});
