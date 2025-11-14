import { message, TreeDataNode, TreeSelect, TreeSelectProps } from 'antd';
import { useCallback, useRef, useState } from 'react';
import { fetchGitLabTrees } from './api';
import { useNewProjectModal } from './store';
import { GitLabTree } from './types';

export function useRepoPathSelectTree() {
  const useNewProjectModalStore = useNewProjectModal();
  const [treeLoading, setTreeLoading] = useState(false);
  const [treeData, setTreeData] = useState<TreeDataNode[]>([]);
  const treeNodeMapRef = useRef<Record<string, TreeDataNode>>({});
  const currentPath = useNewProjectModalStore(state => state.componentPath);
  const fetchedRepoRef = useRef<string | null>(null);

  const onTreeFocus = useCallback(async () => {
    try {
      const { repoUrl, branch, componentPath } = useNewProjectModalStore.getState();
      if (fetchedRepoRef.current === repoUrl) return;
      setTreeLoading(true);
      const filteredResult = await fetchGitLabTrees(repoUrl, branch, componentPath);
      const treeData = tress2TreeData(filteredResult);
      setTreeData(treeData);
      treeNodeMapRef.current = treeData.reduce((acc, item) => {
        acc[item.key as string] = item;
        return acc;
      }, {} as Record<string, TreeDataNode>);
      fetchedRepoRef.current = repoUrl;
      setTreeLoading(false);
    } catch (error) {
      console.error(error);
      setTreeLoading(false);
      message.error('error_in_load_data');
    }
  }, []);

  const onTreeSelect = useCallback((value: string) => {
    const node = treeNodeMapRef.current[value];
    if (node) {
      useNewProjectModalStore.getState().handleComponentPathChange((node as unknown as { path: string }).path);
    }
  }, []);

  const loadData: TreeSelectProps['loadData'] = useCallback(
    async node => {
      try {
        const { repoUrl, branch } = useNewProjectModalStore.getState();
        const { path } = node as unknown as { path: string };

        const filteredResult = await fetchGitLabTrees(repoUrl, branch, path);
        const newTreeData = tress2TreeData(filteredResult).map(item => ({ ...item }));

        if (filteredResult.length === 0) {
          treeNodeMapRef.current[node.key as string].isLeaf = true;
        } else {
          treeNodeMapRef.current[node.key as string].children = newTreeData;
        }
        setTreeLoading(false);
        setTreeData([...treeData]);
        treeNodeMapRef.current = {
          ...treeNodeMapRef.current,
          ...newTreeData.reduce((acc, item) => {
            acc[item.key as string] = item;
            return acc;
          }, {} as Record<string, TreeDataNode>)
        };
      } catch (error) {
        console.error('error_in_load_data', error);
        setTreeLoading(false);
        fetchedRepoRef.current = useNewProjectModalStore.getState().repoUrl;
        message.error('error_in_load_data');
      }
    },
    [treeData]
  );

  return {
    treeData,
    treeLoading,
    currentPath,
    onTreeFocus,
    onTreeSelect,
    loadData
  };
}

function tress2TreeData(trees: GitLabTree[]): TreeDataNode[] {
  return trees.map(tree => ({
    id: tree.id,
    pId: 0,
    key: tree.id,
    value: tree.id,
    path: tree.path,
    title: tree.name,
    children: [],
    isLeaf: tree.type === 'blob'
  }));
}

/**
 * 仓库路径选择树
 */
export const RepoPathSelectTree = () => {
  const { treeData, treeLoading, currentPath, onTreeFocus, onTreeSelect, loadData } = useRepoPathSelectTree();
  return (
    <TreeSelect
      style={{ width: '100%' }}
      onFocus={onTreeFocus}
      onSelect={onTreeSelect}
      loadData={loadData}
      treeData={treeData}
      placeholder="请选择业务组件路径"
      loading={treeLoading}
      value={currentPath}
      treeNodeLabelProp="path"
    />
  );
};
