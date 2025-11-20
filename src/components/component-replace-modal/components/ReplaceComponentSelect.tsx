import React from 'react';
import { SwitchOrder } from '@/components/icon';
import { DeveloperService } from '@/service/developer';
import { Button, Select, Form } from 'antd';
import { useComponentReplaceModal } from '../store';

const FormItem = Form.Item;

export const ReplaceComponentSelect = () => (
  <FormItem label="组件名称" required>
    <div className="flex items-center flex-1">
      <ComponentNameSelect />
      <ForceFetchReplaceComponentListButton />
    </div>
  </FormItem>
);

ReplaceComponentSelect.displayName = 'ReplaceComponentSelect';

function ForceFetchReplaceComponentListButton() {
  const useComponentReplaceModalStore = useComponentReplaceModal();
  const forceFetchReplaceComponentList = async () => {
    const res = await DeveloperService.fetchReplaceComponentList(true);
    useComponentReplaceModalStore.getState().setReplaceComponentSelectOptions(res);
  };
  return <Button icon={<SwitchOrder />} onClick={forceFetchReplaceComponentList} size="small" />;
}

function ComponentNameSelect() {
  const useComponentReplaceModalStore = useComponentReplaceModal();
  const replaceComponentSelectOptions = useComponentReplaceModalStore(state => state.replaceComponentSelectOptions);
  const name = useComponentReplaceModalStore(state => state.values.name);

  return (
    <Select
      options={replaceComponentSelectOptions}
      className="flex-1"
      size="small"
      onSelect={useComponentReplaceModalStore.getState().setName}
      value={name}
    />
  );
}

export const WithReplaceComponentSelect: React.FC<React.PropsWithChildren> = ({ children }) => {
  const useComponentReplaceModalStore = useComponentReplaceModal();
  const replaceComponentSelectOptions = useComponentReplaceModalStore(state => state.replaceComponentSelectOptions);
  if (replaceComponentSelectOptions.length === 0) {
    return children;
  }
  return <ReplaceComponentSelect />;
};
