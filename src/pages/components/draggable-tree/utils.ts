import { BasicDataNode, DataNode } from 'antd/es/tree';
import { cloneDeep } from 'lodash';
import { nanoid } from 'nanoid';
import { waitForDebugger } from 'node:inspector';

export type FieldDataNode<T, ChildFieldName extends string = 'children'> = T & Partial<Record<ChildFieldName, FieldDataNode<T, ChildFieldName>[]>>;

type BasicTreeNode = FieldDataNode<Partial<Record<string, any>>>;

export type NodeKey = string | number;

const traversalDFS = <T extends BasicDataNode = DataNode>(
  tree: T[],
  callback: (node: T) => void,
  fieldChildren = 'children'
) => {
  const queue = [...tree];

  while (queue.length) {
    const node = queue.shift();
    callback(node);

    const child = node[fieldChildren];

    if (child) {
      for (let i = 0; i < child.length; i++) {
        const element = child[i];
        queue.unshift(element as T);
      }
    }
  }
};

export const findNode = <T extends DataNode = DataNode>(
  tree: T[],
  callback: (node: T) => any,
  fieldChildren = 'children'
) => {
  const list: T[] = [];

  const fn = (node: T) => callback(node) && list.push(node);

  traversalDFS(tree, fn, fieldChildren);

  return list;
};

export const findNodeByKey = <T extends DataNode = DataNode>(tree: T[], targetKey: NodeKey, fieldKey = 'key') => {
  return findNode(tree, (node) => node[fieldKey] === targetKey)?.[0];
};

/**
 * 递归遍历删除当前节点
 * @param tree
 * @param key
 * @param keyName
 * @returns
 */
export function deleteNode<T extends DataNode = DataNode>(
  root: T[],
  key?: string | number | null,
  fieldKey = 'key',
  fieldChildren = 'children'
): T[] {
  return root.filter(node => {
    node[fieldChildren] = node[fieldChildren]?.length ? deleteNode(node[fieldChildren], key, fieldKey) : undefined;
    return node[fieldKey] !== key;
  });
}


export function findKeyIndices<T extends DataNode = DataNode>(tree: T[], targetKey: NodeKey, fieldNames: {
  key?: string;
  children?: string;
} = {
  key: 'key',
  children: 'children'
}): number[] {
  const indices: number[] = [];

  // 递归函数，用于遍历树节点
  function traverse(nodes: T[], path: number[] = []): void {
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      const newPath = [...path, i];
      if (node[fieldNames.key ?? 'key'] === targetKey) {
        indices.push(...newPath);
      }
      if (node[fieldNames.children ?? 'children']) {
        traverse(node[fieldNames.children ?? 'children'] as T[], newPath);
      }
    }
  }

  traverse(tree);
  return indices;
}

export function findNodeByIndices<T extends BasicTreeNode = BasicTreeNode>(tree: T[], indices: number[], fieldNames: {
  children?: string;
} = {
  children: 'children'
}) {
  if (!indices.length) return null;
  if (indices.length === 1) return tree.find((_, i) => i === indices[0]);
  let data = {
    [fieldNames.children]: tree
  } as unknown as T;
  const ids = [...indices];
  while (ids.length > 0 && data?.[fieldNames.children]?.length) {
    const index = ids.shift();
    data = data[fieldNames.children][index] as T;
  }
  return data;
}

export function addNodeByIndices<T extends BasicTreeNode = BasicTreeNode>(tree: T[], indices?: number[], addNode?: T, insertIndex = -1, fieldNames: {
  children?: string;
} = {
  children: 'children'
}) {
  const treeClone = cloneDeep(tree);
  const addonNode = (addNode ? addNode : {}) as T;
  if (!indices?.length) {
    treeClone.push(addonNode);
    return treeClone;
  }
  const nodeData = findNodeByIndices(
    treeClone,
    indices,
    fieldNames
  );
  const children = nodeData[fieldNames.children];
  const childrenField = fieldNames.children;
  if (!children) {
    (nodeData as BasicTreeNode)[childrenField] = [];
  }

  if (insertIndex === -1) {
    nodeData[childrenField].push(addonNode);
  } else {
    nodeData[childrenField].splice(insertIndex, 0, addonNode);
  }
  return treeClone;
}

export function updateNodeByIndices<T extends BasicTreeNode = BasicTreeNode>(tree: T[], indices?: number[], updateNode?: T, fieldNames: {
  children?: string;
} = {
  children: 'children'
}) {
  const treeClone = cloneDeep(tree);
  const updatedNode = (updateNode ? updateNode : {}) as T;
  const prevIndices = indices.slice(0, indices.length - 1);
  const lastIndex = indices[indices.length - 1];
  const parentNode = findNodeByIndices(treeClone, prevIndices, fieldNames);
  if (parentNode) {
    const node = parentNode.children[lastIndex];
    if (!indices.length) return treeClone;
    parentNode.children.splice(lastIndex, 1, {
      ...node,
      ...updatedNode,
    });
  } else {
    treeClone.splice(lastIndex, 1, {
      ...treeClone[lastIndex],
      ...updatedNode,
    });
  }

  // if (indices.length === 1) {
  //   treeClone.splice(indices[0], 1, {
  //     ...node,
  //     ...updatedNode,

  //   });
  // }
  return treeClone;
}


export function removeNodeByIndices<T extends BasicTreeNode = BasicTreeNode>(tree: T[], indices: number[], fieldNames: {
  children?: string;
} = {
  children: 'children'
}) {
  const treeNode = cloneDeep(tree);
  if (!indices.length) return treeNode;
  if (indices.length === 1) return treeNode.filter((_, i) => i !== indices[0]);
  const ids = [...indices];
  let node = {
    [fieldNames.children]: treeNode
  } as unknown as T;
  while (ids.length > 1 && node?.[fieldNames.children]?.length) {
    node = node[fieldNames.children][ids.shift()] as T;
  }
  delete node[ids[0]];
  return treeNode;
}