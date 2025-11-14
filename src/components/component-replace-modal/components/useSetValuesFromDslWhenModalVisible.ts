import { DSLStoreContext } from '@/hooks/context';
import { ReplaceComponentWithBusinessValues } from '@/service/dsl-store/services/replaceComponentWithBusiness';
import { toCopyId } from '@/service/dsl-store/services/replaceComponentWithBusiness';
import IPageSchema from '@/types/page.schema';
import { useContext, useEffect } from 'react';
import { useComponentReplaceModal } from '../store';

/**
 * 组件可见时将 dsl 中的值提取到 values 中
 */
export function useSetValuesFromDslWhenModalVisible() {
  const dslStore = useContext(DSLStoreContext);
  const useComponentReplaceModalStore = useComponentReplaceModal();
  const visible = useComponentReplaceModalStore(state => state.visible);
  const targetComponentId = useComponentReplaceModalStore(state => state.targetComponentId);

  useEffect(() => {
    if (visible) {
      const values = dSLDef2Values(dslStore.dsl, targetComponentId);
      useComponentReplaceModalStore.getState().setValues(values);
    }
  }, [visible, useComponentReplaceModalStore, dslStore.dsl, targetComponentId]);

  return visible;
}

function dSLDef2Values(dsl: IPageSchema, componentId: string): ReplaceComponentWithBusinessValues {
  const copyId = toCopyId(componentId);
  const name = dsl.businessReplacement?.[copyId]?.name;
  const props = dsl.businessReplacement?.[copyId]?.propsRefs ?? [];
  const children = dsl.businessReplacement?.[copyId]?.children?.map(child => child.current) ?? [];
  const dependency = dsl.businessReplacement?.[copyId]?.dependency;
  return {
    name,
    props,
    children,
    dependency
  };
}
