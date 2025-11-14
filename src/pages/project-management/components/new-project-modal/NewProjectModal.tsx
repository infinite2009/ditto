import React, { useCallback, useEffect } from 'react';
import { CloseThin, WebSmall, PhoneSmall } from '@/components/icon';

import _styles from './NewProjectModal.module.less';
const cn = withClassName(_styles);

import { createComponentWithNewProjectModalHookStore, useNewProjectModal } from './store';
import { NewProjectModalStore } from './types';
import { RepoPathSelectTree } from './RepoPathSelectTree';
import { withClassName } from './utils';
import { FoldPanel } from '@/components/voltron-design-rc/FoldPanel';
import { RepoInput } from './RepoInput';
import { BranchInput } from './BranchInput';

/**
 * 新建弹窗组件
 * 
 * 组成的原子组件部分: <
 */
export const NewProjectModal = createComponentWithNewProjectModalHookStore(function NewProjectModal() {
  return (
    <NewProjectModalLayout>
      <FormItem label="项目名称">
        <ProjectNameInput />
      </FormItem>
      <FormItem label="项目载体">
        <PlatformSelect />
      </FormItem>
      <CustomRepoFoldPanel />
    </NewProjectModalLayout>
  );
});

function FormItem({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className={cn('form-item')}>
      <span className={cn('form-label', 'form-label-required')}>{label}</span>
      {children}
    </div>
  );
}

function NewProjectModalLayout({ children }: React.PropsWithChildren) {
  return (
    <div className={cn('dialog-container')}>
      <LayoutHeader />
      <div className={cn('dialog-content')}>{children}</div>
      <LayoutFooter />
    </div>
  );
}

function LayoutHeader() {
  return (
    <div className={cn('dialog-header')}>
      <span className={cn('dialog-title')}>新建项目</span>
      <CloseThin style={{ padding: 4, fontSize: 16 }} onClick={useNewProjectModal().getState().onCancel} />
    </div>
  );
}

function LayoutFooter() {
  return (
    <div className={cn('dialog-footer')}>
      <div className={cn('button')} onClick={useNewProjectModal().getState().onCancel}>
        取消
      </div>
      <div className={cn('button', 'button-primary')} onClick={useNewProjectModal().getState().onOk}>
        确认
      </div>
    </div>
  );
}

const PlatformSelect = () => {
  const useNewProjectModalStore = useNewProjectModal();
  const platform = useNewProjectModalStore(state => state.platform);
  const handleSelectPC = useCallback(() => {
    useNewProjectModalStore.getState().handlePlatformChange('pc');
  }, []);
  const handleSelectMobile = useCallback(() => {
    useNewProjectModalStore.getState().handlePlatformChange('mobile');
  }, []);
  return (
    <div className={cn('form-input-wrapper')}>
      <div className={cn('select-item', { 'select-item-active': platform === 'pc' })} onClick={handleSelectPC}>
        <WebSmall style={{ fontSize: 16 }} />
        <span>PC页面</span>
      </div>
      <div className={cn('select-item', { 'select-item-active': platform === 'mobile' })} onClick={handleSelectMobile}>
        <PhoneSmall style={{ fontSize: 16 }} />
        <span>Mobile页面</span>
      </div>
    </div>
  );
};

PlatformSelect.displayName = 'PlatformSelect';

const ErrorMessage = ({ field }: { field: keyof NewProjectModalStore['errors'] }) => {
  const error = useNewProjectModal()(state => state.errors[field]);
  if (error) {
    return <span className={cn('form-error-message')}>{error}</span>;
  }
  return null;
};
const ProjectNameInput = () => {
  const ref = React.useRef<HTMLDivElement>(null);
  const projectName = useNewProjectModal()(state => state.name);
  useEffect(() => {
    if (ref.current) {
      const input = ref.current.querySelector('input');
      if (input) {
        input.addEventListener('input', () => {
          ref.current?.style.setProperty('--limit-length', `'${input.value.length}/20'`);
        });
      }
    }
  }, []);
  return (
    <div
      className={cn('form-input-wrapper', 'form-text-input-wrapper')}
      style={{ '--limit-length': "'0/20'" } as React.CSSProperties}
      ref={ref}
    >
      <input
        className={cn('form-input')}
        placeholder="请输入项目名称"
        maxLength={20}
        value={projectName}
        onChange={useNewProjectModal().getState().handleProjectNameChange}
      />
      <ErrorMessage field="name" />
    </div>
  );
};

ProjectNameInput.displayName = 'ProjectNameInput';

const CustomRepoFoldPanel = () => {
  const showComponentLib = useNewProjectModal()(state => state.showComponentLib);
  return (
    <FoldPanel
      title="业务组件库"
      desc="（设置后可调用/替换业务组件库）"
      visible={showComponentLib}
      setVisible={useNewProjectModal().getState().toggleShowComponentLib}
    >
      <div className={cn('fold-panel-content')}>
        <div className={cn('form-item')}>
          <span className={cn('form-label')}>代码仓库短语</span>
          <div className={cn('form-input-wrapper', 'form-text-input-wrapper')}>
            <RepoInput />
            <ErrorMessage field="repoUrl" />
          </div>
        </div>
        <MoreInfoPanel />
      </div>
    </FoldPanel>
  );
};

CustomRepoFoldPanel.displayName = 'CustomRepoFoldPanel';

const MoreInfoPanel = () => {
  const len = useNewProjectModal()(state => state.repoUrl.length);
  if (len === 0) {
    return null;
  }
  return (
    <>
      <div className={cn('form-item')}>
        <span className={cn('form-label', 'form-label-required')}>分支名称</span>
        <div className={cn('form-input-wrapper')}>
          <BranchInput />
          <ErrorMessage field="branch" />
        </div>
      </div>
      <div className={cn('form-item')}>
        <span className={cn('form-label', 'form-label-required')}>组件路径</span>
        <div className={cn('form-input-wrapper')}>
          <RepoPathSelectTree />
          <ErrorMessage field="componentPath" />
        </div>
      </div>
    </>
  );
};
