import { Button, Space, Tree, TreeProps } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import { deleteNode, findKeyIndices, findNode } from './utils';
import { BasicDataNode, DataNode } from 'antd/es/tree';
import { nanoid } from 'nanoid';
import Title from './Title';
import { mapTree, setTree } from '@/util';
import { isFunction } from 'lodash';

export type DraggableTreeProps<TreeDataType extends BasicDataNode = DataNode> = Omit<TreeProps, 'treeData'> & {
  value?: TreeDataType[];
  styles?: {
    input?: (data: TreeDataType) => React.CSSProperties;
  };
  showAddBtn?: boolean;
  expandedKeyPath?: string[];
  onChange?: (val: TreeDataType[]) => void;
  onDragend?: (val: TreeDataType[]) => void;
  renderTitle?: (
    nodeData: TreeDataType,
    indices: number[],
    {
      addChild,
      removeChild,
      updateChild
    }: {
      addChild: (addData?: Record<string, unknown>) => void;
      removeChild: () => void;
      updateChild: (updateChild: Record<string, unknown>) => void;
    }
  ) => React.ReactNode;
  renderExtra?: (
    data: TreeDataType,
    actions: { updateNode: (data: Record<string, unknown>) => void }
  ) => React.ReactNode;
  renderExtraAction?: (data: TreeDataType) => React.ReactNode;
};

export type Key = string | number | null | undefined;

function DraggableTree<TreeDataType extends DataNode = DataNode>({
  value,
  styles = {},
  onChange,
  onDragend,
  renderExtra,
  renderExtraAction,
  renderTitle,
  expandedKeyPath,
  showAddBtn = true,
  draggable = true,
  ...restProps
}: DraggableTreeProps<TreeDataType>) {
  const { fieldNames = {} } = restProps;
  const fieldKey = fieldNames.key || 'key';
  const fieldTitle = fieldNames.title || 'title';
  const fieldChildren = fieldNames.children || 'children';
  const [options, setOptions] = useState(value);
  const [expandedKeys, setExpandedKeys] = useState<TreeProps['expandedKeys']>([]);
  const [focusKey, setFocusKey] = useState<string>();
  const allKeys = useMemo(() => {
    const result: string[] = [];
    mapTree(options, item => {
      if (item?.[fieldChildren]?.length) {
        result.push(item[fieldKey]);
      }
      return item;
    });
    return result;
  }, [options]);
  const showCollapseBtn = useMemo(() => {
    return value.some(v => v?.[fieldChildren]?.length > 0);
  }, [value]);

  const findTreeNode = (key?: Key) => {
    return findNode(
      options,
      curNode => {
        return curNode[fieldKey] === key;
      },
      fieldChildren
    )[0];
  };

  /**
   * 找到所在下标
   * @param nodeData
   */
  const getKeyIndices = (nodeData: TreeDataType) => {
    return findKeyIndices(value, nodeData[fieldKey], {
      key: fieldKey,
      children: fieldChildren
    });
  };

  const onUpdateNode = (tree: TreeDataType[]) => {
    // const newTree = [...options];
    setOptions([...tree]);
    onChange?.([...tree]);
  };

  const addTreeNode = (parentKey: Key, data: TreeDataType) => {
    if (parentKey) {
      const nodeData = findTreeNode(parentKey);
      const children = nodeData[fieldChildren] as TreeDataType;
      if (!children) {
        nodeData[fieldChildren] = [
          {
            ...data
          }
        ];
      } else {
        nodeData[fieldChildren] = [...(children as any), data];
      }
      onUpdateNode(options);
    } else {
      const newTree = [...options, data];
      setOptions(newTree);
      onChange?.(newTree);
    }
    setFocusKey(data[fieldKey]);
  };

  const updateTreeNode = (key: Key, data: Record<string, unknown>) => {
    let nodeData = findTreeNode(key);
    if (nodeData) {
      nodeData = {
        ...nodeData,
        ...data
      };
      setTree(options, {
        key,
        payload: nodeData,
        fieldName: {
          key: fieldKey,
          children: fieldChildren
        }
      });
      onUpdateNode(options);
    } else {
      throw new Error('节点不存在');
    }
  };

  const removeTreeNode = (key: Key) => {
    const newData = deleteNode(options as unknown as DataNode[], key, fieldKey) as unknown as TreeDataType[];
    setOptions(newData);
    onChange?.(newData);
  };

  const onDragEnter: TreeProps['onDragEnter'] = info => {
    console.log('onDragEnter', info);
  };

  const onDrop: TreeProps<TreeDataType>['onDrop'] = info => {
    const dropKey = info.node.key;
    const dragKey = info.dragNode.key;
    const dropPos = info.node.pos.split('-');
    const dropPosition = info.dropPosition - Number(dropPos[dropPos.length - 1]); // the drop position relative to the drop node, inside 0, top -1, bottom 1

    const loop = (
      data: TreeDataType[],
      key: React.Key,
      callback: (node: TreeDataType, i: number, data: TreeDataType[]) => void
    ) => {
      for (let i = 0; i < data.length; i++) {
        if (data[i][fieldKey] === key) {
          return callback(data[i], i, data);
        }
        if (data[i][fieldChildren]) {
          loop(data[i][fieldChildren]!, key, callback);
        }
      }
    };
    const data = [...options];

    // Find dragObject
    let dragObj: TreeDataType;
    loop(data, dragKey, (item, index, arr) => {
      arr.splice(index, 1);
      dragObj = item;
    });

    if (!info.dropToGap) {
      // Drop on the content
      loop(data, dropKey, item => {
        item[fieldChildren] = item[fieldChildren] || [];
        // where to insert. New item was inserted to the start of the array in this example, but can be anywhere
        item[fieldChildren].unshift(dragObj);
      });
    } else {
      let ar: TreeDataType[] = [];
      let i: number;
      loop(data, dropKey, (_item, index, arr) => {
        ar = arr;
        i = index;
      });
      if (dropPosition === -1) {
        // Drop on the top of the drop node
        ar.splice(i!, 0, dragObj!);
      } else {
        // Drop on the bottom of the drop node
        ar.splice(i! + 1, 0, dragObj!);
      }
    }
    setOptions(data);
    onChange?.(data);
    onDragend?.(data);
  };

  const onExpand: TreeProps['onExpand'] = expanded => {
    setExpandedKeys(expanded);
  };

  const addChild = (nodeData: BasicDataNode) => {
    return (addData: Record<string, unknown> = {}) => {
      addTreeNode(nodeData[fieldKey], { [fieldKey]: nanoid(), ...addData } as unknown as TreeDataType);
      setExpandedKeys([...expandedKeys, nodeData[fieldKey]]);
    };
  };

  const removeChild = (nodeData: BasicDataNode) => {
    return () => {
      removeTreeNode(nodeData[fieldKey]);
    };
  };
  const updateChild = (nodeData: BasicDataNode) => {
    return (updateData: Record<string, unknown> = {}) => {
      updateTreeNode(nodeData[fieldKey], updateData);
    };
  };

  useEffect(() => {
    if (expandedKeyPath?.length) {
      setExpandedKeys(expandedKeyPath);
      const leaf = expandedKeyPath.map(i => findTreeNode(i)).find(i => !i?.children?.length);
      if (leaf) {
        setFocusKey(leaf[fieldKey]);
      }
    }
  }, [expandedKeyPath]);

  return (
    <>
      {showCollapseBtn && (
        <Space style={{ marginBottom: '8px' }}>
          <Button
            type="link"
            size="small"
            onClick={() => {
              setExpandedKeys([...allKeys]);
            }}
          >
            展开所有
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => {
              setExpandedKeys([]);
            }}
          >
            收起所有
          </Button>
        </Space>
      )}
      <Tree<BasicDataNode>
        treeData={value}
        expandedKeys={expandedKeys}
        onExpand={onExpand}
        onDragEnter={onDragEnter}
        onDrop={onDrop}
        blockNode
        draggable={draggable}
        titleRender={nodeData =>
          isFunction(renderTitle) ? (
            renderTitle(nodeData as TreeDataType, getKeyIndices(nodeData as TreeDataType), {
              addChild: addChild(nodeData),
              removeChild: removeChild(nodeData),
              updateChild: updateChild(nodeData)
            })
          ) : (
            <Title
              nodeData={nodeData}
              fieldKey={fieldKey}
              fieldTitle={fieldTitle}
              addChild={addChild(nodeData)}
              removeNode={removeChild(nodeData)}
              updateNode={updateChild(nodeData)}
              renderExtra={renderExtra}
              renderExtraAction={renderExtraAction}
              autoFocus={nodeData[fieldKey] === focusKey}
              styles={{
                input: styles.input?.(nodeData as TreeDataType)
              }}
            />
          )
        }
        {...restProps}
      ></Tree>
      {showAddBtn && (
        <Space
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end'
          }}
        >
          <Button
            type="link"
            size="small"
            onClick={() => {
              addTreeNode('', { [fieldTitle]: '', [fieldKey]: nanoid() } as unknown as TreeDataType);
            }}
          >
            新增根节点
          </Button>
        </Space>
      )}
    </>
  );
}

export default DraggableTree;
