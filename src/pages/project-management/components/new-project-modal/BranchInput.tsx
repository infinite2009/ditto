import { useCallback } from 'react';
import { useState } from 'react';
import { useNewProjectModal } from './store';
import { Select } from 'antd';
import { fetchGitLabBranches } from './api';
import _styles from './NewProjectModal.module.less';
import { withClassName } from './utils';
const cn = withClassName(_styles);

export function useBranchInput() {
  const useNewProjectModalStore = useNewProjectModal();
  const branch = useNewProjectModalStore(state => state.branch);
  const [options, setOptions] = useState<{ label: string; value: string }[]>([]);
  const handleSearch = useCallback(async (value: string) => {
    try {
      if (value.length === 0) {
        return;
      }
      const result = await fetchGitLabBranches(useNewProjectModalStore.getState().repoUrl, value);
      const options = result.map(item => ({ label: item.name, value: item.name }));
      setOptions(options);
    } catch (error) {
      console.error('error_in_search_branch', error);
    }
  }, []);

  return {
    branch,
    options,
    handleSearch,
    handleBranchChange: useNewProjectModalStore.getState().handleBranchChange
  };
}

/**
 * 分支输入框
 */
export const BranchInput = () => {
  const { branch, options, handleSearch, handleBranchChange } = useBranchInput();
  return (
    <Select
      className={cn('form-input', 'form-select')}
      placeholder="请输入分支名称"
      value={branch}
      showSearch
      onSearch={handleSearch}
      options={options}
      onSelect={handleBranchChange}
    />
  );
};

BranchInput.displayName = 'BranchInput';
