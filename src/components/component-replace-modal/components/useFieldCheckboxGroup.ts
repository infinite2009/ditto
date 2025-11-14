import { useMemo } from 'react';

import { useContext } from 'react';

import { DSLStoreContext } from '@/hooks/context';
import { ComponentReplaceModalStore, useComponentReplaceModal } from '../store';
import { useCallback } from 'react';
import IPageSchema from '@/types/page.schema';

interface Option {
  label: string;
  value: string;
}

interface useFieldCheckboxGroupParams {
  /** 从 ComponentReplaceModalStore 里获取当前选中值 */
  getSelectedValueFromStore: (store: ComponentReplaceModalStore) => string[];
  /** 从 dsl 里获取可选项 */
  getOptionsFromDslStore: (dsl: IPageSchema, getCurrentComponentId: () => string | undefined) => Option[];
  /** 从 ComponentReplaceModalStore 里获取选中值的回调 */
  getSelectedOnChangeFromStore: (store: ComponentReplaceModalStore) => (value: string[]) => void;
}

/**
 * 组装选择值
 * @param params
 * @returns
 */
export function useFieldCheckboxGroup(params: useFieldCheckboxGroupParams) {
  const { getSelectedValueFromStore, getSelectedOnChangeFromStore, getOptionsFromDslStore } = params;
  const useComponentReplaceModalStore = useComponentReplaceModal();
  const selectedValueFromStore = useComponentReplaceModalStore(getSelectedValueFromStore);
  const dslStore = useContext(DSLStoreContext);
  const getCurrentComponentId = useCallback(() => {
    return dslStore.selectedComponent?.id;
  }, []);

  const selectOptions = useMemo(
    () => getOptionsFromDslStore(dslStore.dsl, getCurrentComponentId),
    [getCurrentComponentId, dslStore.dsl]
  );

  const onChange = getSelectedOnChangeFromStore(useComponentReplaceModalStore.getState());

  return [selectOptions, selectedValueFromStore, onChange] as const;
}
