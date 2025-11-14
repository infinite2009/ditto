import { ComponentId } from '@/types';
import { Input, Tree, TreeProps } from 'antd';
import React, { Key, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {DSLStoreContext, IframeCommunicationContext} from '@/hooks/context';
import { observer } from 'mobx-react';
import { findSubTreeByKey, findTreeNode, flattenTree } from '@/util';
import { flatten, uniq } from 'lodash';
import ComponentFeature from '@/types/component-feature';
import IComponentSchema from '@/types/component.schema';
import { Expand } from '@/components/icon';

export interface IComponentTreeProps {
  data: any[];
  onCancelSelect: (componentId: ComponentId) => void;
  onSearch?: (val: string) => void;
  onSelect: (componentId: ComponentId) => void;
  searchValue?: string;
  showSearch?: boolean;
}

const { Search } = Input;

/**
 * bug: 会随着用户拖动鼠标，导致出现 max stack 问题
 */
export default observer(function ComponentTree({
  data,
  onSelect,
  onCancelSelect,
  showSearch,
  onSearch,
}: IComponentTreeProps) {
  const dslStore = useContext(DSLStoreContext);
  const iframeCommunicationService = useContext(IframeCommunicationContext);

  const [expandedKeys, setExpandedKeys] = useState<React.Key[]>([]);
  const [autoExpandParent, setAutoExpandParent] = useState(true);

  function handleSelectingComponent(selectedKeys: Key[], e: { selected: boolean; node: any }) {
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

  const flattenData = useMemo(() => {
    return flattenTree(data, i => ({
      key: i.key,
      name: i.name
    }));
  }, [data]);

  const getExpandedKey = (key: string): string[] => {
    const currentTree = findSubTreeByKey(data, key);
    if (currentTree) {
      return flattenTree([currentTree], node => node.key);
    }
    return [];
  };

  useEffect(() => {
    if (dslStore.selectedComponent?.id) {
      const expandedKeyList = getExpandedKey(dslStore.selectedComponent?.id);
      setExpandedKeys(uniq([...expandedKeys, ...expandedKeyList]));
    }
  }, [dslStore.selectedComponent?.id]);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    const newExpandedKeysMatrix = flattenData.map(item => {
      if (item.name.indexOf(value) > -1 || item.key.toUpperCase().indexOf(value.toUpperCase()) > -1) {
        return getExpandedKey(item.key);
      }
      return null;
    });

    const newExpandedKeys = uniq(flatten(newExpandedKeysMatrix));
    setExpandedKeys(newExpandedKeys);
    onSearch(value);
    setAutoExpandParent(true);
  };

  const renderTitle = useCallback((nodeData: { name: string; key: string; title: string }) => {
    return <span>{nodeData.title}</span>;
  }, []);

  const onDrop: TreeProps['onDrop'] = info => {
    const dropKey = info.node.key as string;
    const dragKey = info.dragNode.key as string;
    const dropPos = info.node.pos.split('-');
    const dropPosition = info.dropPosition - Number(dropPos[dropPos.length - 1]); // the drop position relative to the drop node, inside 0, top -1, bottom 1
    const dropItem = dslStore.dsl.componentIndexes[dropKey];
    const canDrop = (feature: IComponentSchema['feature']) =>
      [ComponentFeature.root, ComponentFeature.container, ComponentFeature.slot].includes(feature);
    if (!info.dropToGap && canDrop(dropItem.feature)) {
      // 拖拽到节点上 且 当前节点是可拖放区域，放到其内部第一个
      dslStore.moveComponent(dropKey, dragKey, 0);
    } else {
      // 拖拽到节点之间 或 当前节点不是可拖放区域，找到放到该元素后面
      const currentParent = findTreeNode(data, node => node.key === dropItem.parentId)[0];
      const insertIndex = currentParent?.children?.findIndex(i => i.key === dropKey) + (dropPosition === -1 ? 0 : 1);
      dslStore.moveComponent(dropItem.parentId, dragKey, insertIndex);
    }
  };
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 4 }}>
      {/*{showSearch && <Search style={{ marginBottom: 8 }} placeholder="Search" onChange={onChange} />}*/}
      <div style={{ height: '100%', overflow: 'auto' }}>
        <Tree
          expandedKeys={expandedKeys}
          switcherIcon={<Expand />}
          draggable
          selectedKeys={[dslStore.selectedComponent?.id]}
          treeData={data}
          autoExpandParent={autoExpandParent}
          onSelect={handleSelectingComponent}
          blockNode
          onDrop={onDrop}
          onExpand={(e, info) => {
            setExpandedKeys(e);
            setAutoExpandParent(false);
          }}
          titleRender={renderTitle}
        />
      </div>
    </div>
  );
});
