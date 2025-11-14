import { MinusOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, CascaderProps, Input, Tree } from 'antd';
import { TreeProps } from 'antd/lib';
import { nanoid } from 'nanoid';
import { FC, useState } from 'react';
import { deleteNode, findTreeNode } from '@/util';
import { DefaultOptionType } from 'antd/es/cascader';

interface EditCascaderOptionsProps extends Omit<TreeProps, 'treeData'> {
  value?: CascaderProps['options'];
  onChange?: (val: CascaderProps['options']) => void;
}

interface TitleRenderProps<
  T extends { label?: string; value: string } = {
    label?: string;
    value: string;
  }
> {
  nodeData: T;
  addChild: (key: string, data: T) => void;
  updateNode: (key: string, data: Omit<T, 'value'>) => void;
  removeNode: (key: string) => void;
}

const TitleRender: FC<TitleRenderProps> = ({ nodeData, addChild, updateNode, removeNode }) => {
  const [label, setLabel] = useState(nodeData.label);

  const handleAdd = () => {
    addChild(nodeData.value, { label: '', value: nanoid() });
  };
  const handleDelete = () => {
    removeNode(nodeData.value);
  };

  const handleChange = e => {
    setLabel(e.target.value);
    updateNode(nodeData.value, { label: e.target.value });
  };

  return (
    <div style={{ whiteSpace: 'nowrap' }}>
      <Input
        value={label}
        onChange={handleChange}
        placeholder="title"
        suffix={
          <>
            <PlusOutlined onClick={handleAdd} />
            <MinusOutlined onClick={handleDelete} />
          </>
        }
      />
    </div>
  );
};

const EditCascaderOptions: React.FC<EditCascaderOptionsProps> = ({ value, onChange, ...restProps }) => {
  const [options, setOptions] = useState(value);
  const findNode = key => {
    return findTreeNode(options, curNode => {
      return curNode.value === key;
    })[0];
  };

  const toggleUpdate = () => {
    const newTree = [...options];
    setOptions(newTree);
    console.log('newTree', newTree);
    onChange(newTree);
  };

  const updateNode = (key, data) => {
    const nodeData = findNode(key);
    if (nodeData) {
      nodeData.label = data.label;
      toggleUpdate();
    } else {
      throw new Error('节点不存在');
    }
  };

  const addChild = (parentKey, data) => {
    if (parentKey) {
      const nodeData = findNode(parentKey);

      if (!nodeData.children) {
        nodeData.children = [data];
      } else {
        nodeData.children = [...nodeData.children, data];
      }
      toggleUpdate();
    } else {
      const newTree = [...options, data];
      setOptions(newTree);
      onChange(newTree);
    }
  };
  const removeNode = key => {
    const newData = deleteNode(options, key);
    setOptions(newData);
    onChange(newData);
  };

  // const onDrop: TreeProps['onDrop'] = (info) => {
  //   console.log('onDrop', info);
  //   // const dropKey

  // };
  const onDrop: TreeProps['onDrop'] = info => {
    const dropKey = info.node.key;
    const dragKey = info.dragNode.key;
    const dropPos = info.node.pos.split('-');
    const dropPosition = info.dropPosition - Number(dropPos[dropPos.length - 1]); // the drop position relative to the drop node, inside 0, top -1, bottom 1

    const loop = (
      data: CascaderProps['options'],
      key: React.Key,
      callback: (node: DefaultOptionType, i: number, data: CascaderProps['options']) => void
    ) => {
      for (let i = 0; i < data.length; i++) {
        if (data[i].value === key) {
          return callback(data[i], i, data);
        }
        if (data[i].children) {
          loop(data[i].children!, key, callback);
        }
      }
    };
    const data = [...options];

    // Find dragObject
    let dragObj: DefaultOptionType;
    loop(data, dragKey, (item, index, arr) => {
      arr.splice(index, 1);
      dragObj = item;
    });

    if (!info.dropToGap) {
      // Drop on the content
      loop(data, dropKey, item => {
        item.children = item.children || [];
        // where to insert. New item was inserted to the start of the array in this example, but can be anywhere
        item.children.unshift(dragObj);
      });
    } else {
      let ar: DefaultOptionType[] = [];
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
  };

  const onDragEnter: TreeProps['onDragEnter'] = info => {
    console.log('onDragEnter', info);
  };

  const mergeNodeRender = nodeData => {
    return (
      <TitleRender
        nodeData={nodeData}
        updateNode={updateNode}
        addChild={addChild}
        removeNode={removeNode}
      ></TitleRender>
    );
  };

  return (
    <>
      <Tree
        treeData={value}
        onDragEnter={onDragEnter}
        onDrop={onDrop}
        blockNode
        draggable
        titleRender={mergeNodeRender}
        fieldNames={{
          title: 'label',
          key: 'value'
        }}
        {...restProps}
      ></Tree>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end'
        }}
      >
        <Button
          type="link"
          onClick={() => {
            addChild('', { label: '', value: nanoid() });
          }}
        >
          新增根节点
        </Button>
      </div>
    </>
  );
};

export default EditCascaderOptions;
