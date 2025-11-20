import { useComponentReplaceModal, ComponentReplaceModalStore } from '../store';

import { useCallback } from 'react';
import { Form, Input } from 'antd';

const FormItem = Form.Item;

interface CreateInputParams {
  label: string;
  placeholder: string;
  maxLength?: number;
  getValueFromStore: (store: ComponentReplaceModalStore) => string;
  getValueSetterFromStore: (store: ComponentReplaceModalStore) => (value: string) => void;
  getErrorMsgFromStore: (store: ComponentReplaceModalStore) => string | undefined;
}

function createFieldInput(params: CreateInputParams) {
  return function FieldInput() {
    const useComponentReplaceModalStore = useComponentReplaceModal();
    const value = useComponentReplaceModalStore(params.getValueFromStore);
    const handleValueChange = useCallback(
      (ev: React.ChangeEvent<HTMLInputElement>) => {
        params.getValueSetterFromStore(useComponentReplaceModalStore.getState())(ev.target.value);
      },
      [useComponentReplaceModalStore]
    );

    const errorMsg = useComponentReplaceModalStore(params.getErrorMsgFromStore);

    return (
      <FormItem label={params.label} required>
        <div className="relative flex-1">
          <Input
            placeholder={params.placeholder}
            maxLength={params.maxLength}
            value={value}
            onChange={handleValueChange}
          />
          {errorMsg && <div className="text-required-red absolute -bottom-24 text-xs/loose">{errorMsg}</div>}
        </div>
      </FormItem>
    );
  };
}

export default createFieldInput;
