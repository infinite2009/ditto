import { ComponentId } from '@/types';
import { Tree } from 'antd';
import { Key, useContext } from 'react';
import { DSLStoreContext } from '@/hooks/context';
import { observer } from 'mobx-react';

export interface IComponentTreeProps {
  data: any[];
  onSelect: (componentId: ComponentId) => void;
  onCancelSelect: (componentId: ComponentId) => void;
}

export default observer(function ComponentTree({ data, onSelect, onCancelSelect }: IComponentTreeProps) {
  const dslStore = useContext(DSLStoreContext);

  function handleSelectingComponent(selectedKeys: Key[], e: { selected: boolean; node: any }) {
    // TODO: 待实现
    if (selectedKeys.length) {
      if (onSelect) {
        onSelect(selectedKeys[0] as ComponentId);
      }
    } else {
      if (onCancelSelect && e.selected) {
        onCancelSelect(e.node.id);
      }
    }
  }

  return <Tree selectedKeys={[dslStore.selectedComponent?.id]} treeData={data} onSelect={handleSelectingComponent} />;
});
