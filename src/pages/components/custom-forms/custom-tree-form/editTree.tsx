import { MinusOutlined, PlusOutlined } from '@ant-design/icons';
import { Input, Tree, TreeProps } from 'antd';
import debounce from 'lodash/debounce';
import { useState } from 'react';
import { findTreeNode, removeTreeNode } from './utils';
import { nanoid } from 'nanoid';

const titleRender = (nodeData, { addChild, updateNode, removeNode }) => {
  const handleAdd = () => {
    const key = nanoid();
    addChild(nodeData.key, { title: '', key: key, value: key });
  };
  const handleDelete = () => {
    removeNode(nodeData.key);
  };

  const handleChange = debounce(e => {
    updateNode(nodeData.key, { title: e.target.value });
  });

  return (
    <div style={{ whiteSpace: 'nowrap' }}>
      <Input
        value={nodeData.title}
        onChange={handleChange}
        suffix={
          <>
            <a>
              <PlusOutlined onClick={handleAdd} />
            </a>
            <a>
              <MinusOutlined onClick={handleDelete} />
            </a>
          </>
        }
      />
    </div>
  );
};

interface EditTreeProps extends Omit<TreeProps, 'treeData' | 'draggable' | 'onDragEnd'> {
  value?: TreeProps['treeData'];
  onChange?: (val: TreeProps['treeData']) => void;
}

const EditTree: React.FC<EditTreeProps> = props => {
  const { value, onChange, ...resetProps } = props;
  const [treeData, setTreeData] = useState(value);

  const findNode = key => {
    return findTreeNode(treeData, curNode => {
      return curNode.key === key;
    })[0];
  };

  const toggleChange = () => {
    const newTree = [...treeData];
    setTreeData(newTree);
    onChange(newTree);
  };

  const updateNode = (key, data) => {
    const nodeData = findNode(key);
    if (nodeData) {
      nodeData.title = data.title;
      toggleChange();
    } else {
      throw new Error('节点不存在');
    }
  };
  const addChild = (parentKey, data) => {
    const nodeData = findNode(parentKey);

    const mergeData = {
      ...data,
      title: nodeData.title + '-' + (nodeData.children?.length ? nodeData.children?.length + 1 : 1)
    };
    if (!nodeData.children) {
      nodeData.children = [mergeData];
    } else {
      nodeData.children = [...nodeData.children, mergeData];
    }
    toggleChange();
  };

  const removeNode = key => {
    const newData = removeTreeNode(treeData, key);
    setTreeData(newData);
    toggleChange();
  };

  const mergeNodeRender = nodeData => {
    return titleRender(nodeData, {
      updateNode,
      addChild,
      removeNode
    });
  };
  return <Tree treeData={treeData} blockNode titleRender={mergeNodeRender} {...resetProps} draggable={false} />;
};

export default EditTree;
