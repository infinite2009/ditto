import { ComponentId } from '@/types';
import { Tree } from 'antd';
import { Key } from 'react';

export interface IComponentTreeProps {
  data: any[];
  onSelect: (componentId: ComponentId) => void;
  onCancelSelect: (componentId: ComponentId) => void;
}

export default function ComponentTree({ data, onSelect, onCancelSelect }: IComponentTreeProps) {
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

  return <Tree treeData={data} onSelect={handleSelectingComponent} />;
}
