import { message } from 'antd';

import { useContext } from 'react';
import { useComponentReplaceModal } from '../store';
import { DSLStoreContext } from '@/hooks/context';

export function useHandleOk() {
  const useComponentReplaceModalStore = useComponentReplaceModal();
  const dslStore = useContext(DSLStoreContext);
  return async () => {
    useComponentReplaceModalStore.getState().clearErrors();
    try {
      const { values, replaceComponentSelectOptions } = useComponentReplaceModalStore.getState();
      if (!values.name?.trim()) {
        useComponentReplaceModalStore.getState().setErrors({ name: '请输入组件名称' });
        console.warn('no_name', values.name);
        return;
      }

      if (replaceComponentSelectOptions.length > 0) {
        const option = replaceComponentSelectOptions.find(option => option.value === values.name);
        if (option) {
          values.dependency = option.dependency ?? 'unknown_dependency';
        } else {
          message.error('组件名称不存在');
          return;
        }
      }

      if (!values.dependency?.trim()) {
        useComponentReplaceModalStore.getState().setErrors({ dependency: '请输入导入路径' });
        console.warn('no_dependency');
        return;
      }
      const targetComponentId = useComponentReplaceModalStore.getState().targetComponentId;
      dslStore.replaceComponentWithBusiness(targetComponentId, values);
      useComponentReplaceModalStore.getState().setVisible(false);
      message.success('替换成功');
    } catch (error) {
      console.error('error', error);
    }
  };
}
