export interface NewProjectModalProps {
  visible: boolean;
  onOk: (data: NewProjectFormData) => void;
  onCancel: () => void;
  initialValue?: Partial<NewProjectFormData>;
  openComponentLib?: boolean;
  errors?: {
    name?: string;
    repoUrl?: string;
    branch?: string;
    componentPath?: string;
  };
}

export interface NewProjectFormData {
  /** 项目名称 */
  name: string;
  /** 项目载体 */
  platform: 'pc' | 'mobile';
  /** 代码仓库地址 */
  repoUrl: string;
  /** 分支名称 */
  branch: string;
  /** 业务组件路径 */
  componentPath: string;
}

export interface FetchTreeResult {
  urls: string[];
  trees: GitLabTree[];
}

export interface GitLabTree {
  id: string;
  name: string;
  type: 'tree' | 'blob';
  path: string;
  mode: string;
}

export interface NewProjectModalStore {
  onOk: () => void;
  onCancel: () => void;
  /** 项目名称 */
  name: string;
  /** 项目载体 */
  platform: 'pc' | 'mobile';
  /** 代码仓库地址 */
  repoUrl: string;
  /** 分支名称 */
  branch: string;
  /** 业务组件路径 */
  componentPath: string;
  /** 是否显示业务组件库 */
  showComponentLib: boolean;

  /** 错误信息 */
  errors: {
    name: string;
    repoUrl: string;
    branch: string;
    componentPath: string;
  };

  toggleShowComponentLib: () => void;
  handleProjectNameChange: React.ChangeEventHandler<HTMLInputElement>;
  handleRepoUrlChange: React.ChangeEventHandler<HTMLInputElement>;
  handleBranchChange: (value: string) => void;
  handleComponentPathChange: (value: string) => void;
  handlePlatformChange: (platform: 'pc' | 'mobile') => void;
}
