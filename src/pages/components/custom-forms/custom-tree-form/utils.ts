import { TreeDataNode } from 'antd';

const traversalDFS = (tree: any[], callback: (node: any) => void) => {
  const queue = [...tree];

  while (queue.length) {
    let node = queue.shift();
    callback(node);

    const child = node['children'];

    if (child) {
      for (let i = 0; i < child.length; i++) {
        const element = child[i];
        queue.unshift(element);
      }
    }
  }
};
export const loop = (
  data: TreeDataNode[],
  key: React.Key,
  callback: (node: TreeDataNode, i: number, data: TreeDataNode[]) => void
) => {
  for (let i = 0; i < data.length; i++) {
    if (data[i].key === key) {
      return callback(data[i], i, data);
    }
    if (data[i].children) {
      loop(data[i].children!, key, callback);
    }
  }
};
export const findTreeNode = (tree, callback) => {
  const list = [];

  const fn = node => callback(node) && list.push(node);

  traversalDFS(tree, fn);

  return list;
};

export const removeTreeNode = (tree, key) => {
  const queue = [...tree];

  while (queue.length) {
    const node = queue.shift();

    const child = node.children || [];

    const index = child.findIndex(item => item.key === key);
    if (index >= 0) {
      child.splice(index, 1);
    } else if (child) {
      for (let i = 0; i < child.length; i++) {
        const element = child[i];
        queue.unshift(element);
      }
    }
  }

  return [...tree];
};
