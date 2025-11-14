// repositories-branches

import axios from '@/api/request';
import { FetchTreeResult } from './types';

export async function fetchGitLabTrees(repo: string, ref: string, path: string) {
  const result = await axios.get('/voltron/developer/repositories-tree', {
    params: {
      repo,
      ref,
      path
    }
  });

  if (result.code !== 0) {
    throw new Error(result.message);
  }
  // 过滤所有 blob 节点
  return (result.data as FetchTreeResult).trees.filter(tree => tree.type !== 'blob');
}

export async function fetchGitLabBranches(repo: string, search: string) {
  const result = await axios.get('/voltron/developer/repositories-branches', {
    params: {
      repo,
      search
    }
  });

  if (result.code !== 0) {
    throw new Error(result.message);
  }
  return result.data;
}
