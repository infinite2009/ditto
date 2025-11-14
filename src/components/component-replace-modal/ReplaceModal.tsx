import React, { useContext } from 'react';
import { message } from 'antd';
import { toCopyId } from '@/service/dsl-store/services/replaceComponentWithBusiness';
import { DSLStoreContext, EditorStoreContext } from '@/hooks/context';
import { createComponentReplaceModal, useComponentReplaceModal } from './store';
import {
  PropsCheckboxGroupPanel,
  ChildrenCheckboxGroupPanel,
  NameInput,
  DependencyInput,
  WithReplaceComponentSelect
} from './components';
import { useSetValuesFromDslWhenModalVisible } from './components/useSetValuesFromDslWhenModalVisible';
import { useHandleOk } from './components/useHandleOk';
import { VoltronModalWithPortal } from '../VoltronModalWithPortal';
import { ComponentId } from '@/types';

export const ReplaceModal = createComponentReplaceModal(() => {
  useMountShowReplaceModalToEditorStore();
  return (
    <WithVisible>
      <ModalContainer>
        <div className="flex flex-col gap-24">
          <WithReplaceComponentSelect>
            <NameInput />
            <DependencyInput />
          </WithReplaceComponentSelect>
          <PropsCheckboxGroupPanel />
          <ChildrenCheckboxGroupPanel />
        </div>
      </ModalContainer>
    </WithVisible>
  );
});

function WithVisible(props: React.PropsWithChildren) {
  const visible = useSetValuesFromDslWhenModalVisible();
  if (!visible) {
    return null;
  }
  return props.children;
}

/** 挂载 showReplaceModal 方法 到 editorStore */
function useMountShowReplaceModalToEditorStore() {
  const editorStore = useContext(EditorStoreContext);
  const useComponentReplaceModalStore = useComponentReplaceModal();
  editorStore.showReplaceModal = (componentId: ComponentId) => {
    useComponentReplaceModalStore.getState().setTargetComponentId(componentId);
    useComponentReplaceModalStore.getState().setVisible(true);
  };
}

function ModalContainer(props: React.PropsWithChildren) {
  const dslStore = useContext(DSLStoreContext);
  const useComponentReplaceModalStore = useComponentReplaceModal();
  const selectedComponentId = useComponentReplaceModalStore.getState().targetComponentId;

  const isReplaced = !!dslStore.dsl?.businessReplacement?.[toCopyId(selectedComponentId)];

  const handleOk = useHandleOk();

  const handleRemoveReplace = () => {
    dslStore.replaceComponentWithBusiness(useComponentReplaceModalStore.getState().targetComponentId, null);
    useComponentReplaceModalStore.getState().setVisible(false);
    message.success('删除成功');
  };

  const handleClose = React.useCallback(() => {
    useComponentReplaceModalStore.getState().setVisible(false);
  }, []);

  return (
    <VoltronModalWithPortal
      width={540}
      title="替换组件"
      cancelText="取消替换"
      okText="确认替换"
      showCancel={isReplaced}
      onClose={handleClose}
      onCancel={handleRemoveReplace}
      onOk={handleOk}
    >
      {props.children}
    </VoltronModalWithPortal>
  );
}

ReplaceModal.displayName = 'ReplaceModal';
