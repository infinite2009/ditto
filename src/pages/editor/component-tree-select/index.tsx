import { ComponentId } from '@/types';
import { TreeSelect } from 'antd';
import { useContext } from 'react';
import { DSLStoreContext } from '@/hooks/context';
import { observer } from 'mobx-react';
import ComponentSchemaRef from '@/types/component-schema-ref';

export interface IComponentTreeProps extends Omit<TreeSelectProps, 'value' | 'onSelect'> {
  value?: string | string[];
  onSelect?: (componentId: ComponentId) => void;
}

/**
 * 页面内组件树
 */
export default observer(function ComponentTree(props: IComponentTreeProps) {
  const dslStore = useContext(DSLStoreContext);
  const { onSelect } = props || {};

  /**
   * 选中时调用
   */
  function handleSelectingComponent(componentId) {
    onSelect?.(componentId);
  }

  /**
   * 构造页面组件treeData
   */
  function generateComponentTreeData() {
    if (!dslStore.dsl) {
      return [];
    }

    const recursiveMap = data => {
      return data
        .filter((item: ComponentSchemaRef) => !item.isText)
        .map((item: ComponentSchemaRef) => {
          const componentSchema = dsl.componentIndexes[item.current];
          const node: Record<string, string | React.ReactNode> = {
            value: `#${componentSchema.id}`,
            title: <div>{componentSchema.displayName || componentSchema.name}</div>,
            name: componentSchema.displayName || componentSchema.name
          };
          // 组件内的插槽也需要加到 children 里
          const children = dslStore.findNonSlotDescendant(componentSchema.id).map(cmp => {
            return {
              current: cmp.id,
              isText: false
            };
          });
          if (children.length) {
            node.children = recursiveMap(children);
          } else {
            node.isLeaf = true;
          }
          return node;
        });
    };
    const { dsl } = dslStore;
    return recursiveMap([dsl.child]);
  }
  return (
    <TreeSelect
      {...props}
      popupMatchSelectWidth={false}
      style={{ width: '100%' }}
      treeData={generateComponentTreeData()}
      onSelect={handleSelectingComponent}
    />
  );
});
