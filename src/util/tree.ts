type Tree = {
  [key: string]: any;
  children?: Tree[];
};

const traversalDFS = <T extends Tree>(tree: T[], callback: (node: T) => void) => {
  const queue: T[] = [...tree];

  while (queue.length) {
    const node = queue.shift();
    callback(node);

    const child = node['children'];

    if (child) {
      for (let i = 0; i < child.length; i++) {
        const element = child[i];
        queue.unshift(element as T);
      }
    }
  }
};
export const findTreeNode = <T extends Tree>(tree: T[], callback: (node: T) => any): T[] => {
  const list: T[] = [];

  const fn = (node: T) => callback(node) && list.push(node);

  traversalDFS(tree, fn);

  return list;
};

/**
 * 递归遍历删除当前节点
 * @param tree
 * @param key
 * @param keyName
 * @returns
 */
export function deleteNode<T extends Tree, Value = string>(root: T[], value: Value, valueName = 'value'): T[] {
  return root.filter(node => {
    node.children = node.children ? deleteNode(node.children, value) : [];
    return node[valueName] !== value;
  });
}

/**
 * 树递归遍历
 */
export function mapTree<T extends Tree, NT extends Tree>(treeData: T[], callback: (item: T) => NT): NT[] {
  function mapNode(node: T): NT {
    const newNode = callback(node);
    if (newNode?.children) {
      newNode.children = newNode.children.map(mapNode);
    }
    return newNode;
  }
  return treeData?.map(mapNode);
}

export function setTree<T extends Tree>(treeData: T[], {key, payload, fieldName}: {key: string | number; payload: Record<string, any>; fieldName?: Record<'key' | 'children', string>}): T[] {
  const fieldKey = fieldName?.key || 'key';
  const fieldChildren = fieldName?.children || 'children';
  for(let i = 0; i < treeData.length; i++) {
    const node = treeData[i];
    if (node[fieldKey] === key) {
      Object.assign(node, payload);
      return treeData;
    }
    if (node[fieldChildren] && node[fieldChildren].length > 0) {
      setTree(node[fieldChildren], {key, payload, fieldName});
    }
  }
}


export function findSubTreeByKey<T extends Tree = Tree>(tree: T[], targetKey: string): T | null;
export function findSubTreeByKey<T extends Tree = Tree>(tree: T[], callback: (item: T) => boolean): T | null;
export function findSubTreeByKey<T extends Tree = Tree>(tree: T[], filterCondition: string | ((item: T) => boolean)): T | null {
  for (const node of tree) {
    if (typeof filterCondition === 'string' ? node.key === filterCondition : filterCondition(node)) {
      return {
        ...node,
        children: undefined
      };
    }
    if (node.children && node.children.length > 0) {
      const found = findSubTreeByKey(node.children, filterCondition as any);
      if (found) {
        return {
          ...node,
          children: [found]
        };
      }
    }
  }
  return null;
}

export function flattenTree<T extends Tree = Tree>(tree: T[], mapper?: (node: T) => T): T[] {
  const result: T[] = [];
  const flatten = (nodes: T[]) => {
    for(const node of nodes) {
      result.push(node);
      if (node.children && node.children.length > 0) {
        flatten(node.children as T[]);
      }
    }
  };
  flatten(tree);
  if (mapper) {
    return mapTree(result, mapper);
  }
  return result;
}