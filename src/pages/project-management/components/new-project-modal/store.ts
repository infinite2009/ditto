/**
 *
 */

import { createHookStore } from '@/util/createHookStore';
import { NewProjectFormData, NewProjectModalProps, NewProjectModalStore } from './types';

const defaultForm: NewProjectFormData = {
  name: '',
  platform: 'pc',
  repoUrl: '',
  branch: '',
  componentPath: '/'
};

/**
 * 创建一个新项目弹窗的 hook store
 * 
 * 任何被 createComponentWithNewProjectModalHookStore 创建的组件，都可以使用 useNewProjectModal 来获取 store 的值
 */
export const [createComponentWithNewProjectModalHookStore, useNewProjectModal] = createHookStore<
  NewProjectModalStore,
  NewProjectModalProps
>((set, get, props) => {
  const { initialValue } = props;
  const { name, platform, repoUrl, branch, componentPath } = Object.assign({}, defaultForm, initialValue);
  return {
    name,
    platform,
    repoUrl,
    branch,
    componentPath,
    showComponentLib: props.openComponentLib ?? false,
    errors: {
      name: props.errors?.name ?? '',
      repoUrl: props.errors?.repoUrl ?? '',
      branch: props.errors?.branch ?? '',
      componentPath: props.errors?.componentPath ?? ''
    },
    toggleShowComponentLib: () => {
      set({ showComponentLib: !get().showComponentLib });
    },
    onOk: () => {
      const { name, platform, repoUrl, branch, componentPath } = get();

      const errors = {
        name: '',
        repoUrl: '',
        branch: '',
        componentPath: ''
      };

      if (!name) {
        errors.name = '请输入项目名称';
      }

      if (repoUrl) {
        if (!branch) {
          errors.branch = '请输入分支名称';
        }

        if (!componentPath) {
          errors.componentPath = '请输入业务组件路径';
        }

        // TODO 这里需要做代码仓库的正确性校验
      }
      set({ errors });
      if (errors.name || errors.repoUrl || errors.branch || errors.componentPath) {
        return;
      }

      props.onOk({ name, platform, repoUrl, branch, componentPath });
    },
    onCancel: () => {
      // TODO
      props.onCancel();
    },
    handleProjectNameChange: e => {
      set({ name: e.target.value });
    },
    handleRepoUrlChange: e => {
      set({ repoUrl: e.target.value });
    },
    handleBranchChange: value => {
      set({ branch: value });
    },
    handleComponentPathChange: value => {
      set({ componentPath: value });
    },
    handlePlatformChange: (platform: 'pc' | 'mobile') => {
      set({ platform });
    }
  };
});
