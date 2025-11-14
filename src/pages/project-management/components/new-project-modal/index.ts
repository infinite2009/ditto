export * from './NewProjectModal';
export type * from './types';

export { useNewProjectModal, createComponentWithNewProjectModalHookStore } from './store';
export { useBranchInput } from './BranchInput';
export { useRepoPathSelectTree } from './RepoPathSelectTree';
export { useRepoInput } from './RepoInput';

/**
 * # 新建项目弹窗
 * 
 * 如何仅使用 BranchInput ReportPathSelectTree RepoInput 组件的逻辑 ?
 * 
 * ```typescript
 * import { useBranchInput, useRepoPathSelectTree, useRepoInput, createComponentWithNewProjectModalHookStore, useNewProjectModal } from '@pages/project-management/components/NewProjectModal';
 * const useCustomModalStore = useNewProjectModal(); // 这里可以使用完整的 store
 * const { branch, componentPath, repoUrl } = useCustomModalStore(state => state); // 选择器
 * const CustomModal = createComponentWithNewProjectModalHookStore(function CustomModal() {
 *  return (
 *    <div>
 *      <span>分支名称: {branch}</span>
 *      <BranchInput />
 *      <span>业务组件路径: {componentPath}</span>
 *      <RepoPathSelectTree />
 *      <span>仓库地址: {repoUrl}</span>
 *      <RepoInput />
 *    </div>
 *  );
 * });
 * 
 * // CustomModal 组件本身支持一些 props
 * const App = () => <CustomModal visible={true} onOk={onOk} onCancel={onCancel} initialValue={{...}} />;
 * 
 * ```
 */
export type DOC = 'EXAMPLE';