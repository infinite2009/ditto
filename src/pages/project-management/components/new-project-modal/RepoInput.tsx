import { useNewProjectModal } from './store';
import _styles from './NewProjectModal.module.less';
import { withClassName } from './utils';
const cn = withClassName(_styles);

export function useRepoInput() {
  const repoUrl = useNewProjectModal()(state => state.repoUrl);
  return {
    repoUrl,
    handleRepoUrlChange: useNewProjectModal().getState().handleRepoUrlChange
  };
}

/** 仓库输入名 */
export const RepoInput = () => {
  const { repoUrl, handleRepoUrlChange } = useRepoInput();
  return (
    <input className={cn('form-input')} placeholder="请输入Git地址" value={repoUrl} onChange={handleRepoUrlChange} />
  );
};

RepoInput.displayName = 'RepoInput';
