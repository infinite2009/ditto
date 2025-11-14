import { ReplaceComponentSelectOption } from '@/service/developer';
import { ReplaceComponentWithBusinessValues } from '@/service/dsl-store/services/replaceComponentWithBusiness';
import { ComponentId } from '@/types';
import { createHookStore } from '@/util/createHookStore';

export interface ComponentReplaceModalStore {
  visible: boolean;
  targetComponentId: ComponentId | null;
  setVisible: (visible: boolean) => void;
  onClose: () => void;
  onOk: () => void;
  values: ReplaceComponentWithBusinessValues;
  setValues: (values: ReplaceComponentWithBusinessValues) => void;
  setName: (name: string) => void;
  setDependency: (dependency: string) => void;
  setProps: (props: string[]) => void;
  setChildren: (children: string[]) => void;
  errors?: {
    name?: string;
    dependency?: string;
  };
  setErrors: (errors: { name?: string; dependency?: string }) => void;
  clearErrors: () => void;
  replaceComponentSelectOptions: ReplaceComponentSelectOption[];
  setReplaceComponentSelectOptions: (options: ReplaceComponentSelectOption[]) => void;
  setTargetComponentId: (componentId: ComponentId) => void;
}

export const [createComponentReplaceModal, useComponentReplaceModal] = createHookStore<
  ComponentReplaceModalStore,
  object
>((set, get) => {
  return {
    visible: false,
    targetComponentId: null,
    setTargetComponentId: (componentId: ComponentId) => set({ targetComponentId: componentId }),
    setVisible: (visible: boolean) => set({ visible }),
    onClose: () => set({ visible: false }),
    onOk: () => set({ visible: false }),
    values: {
      name: '',
      props: [],
      children: [],
      dependency: ''
    },
    setValues: (values: ReplaceComponentWithBusinessValues) => set({ values }),
    setName: (name: string) => set({ values: { ...get().values, name } }),
    setDependency: (dependency: string) => set({ values: { ...get().values, dependency } }),
    setProps: (props: string[]) => set({ values: { ...get().values, props } }),
    setChildren: (children: string[]) => set({ values: { ...get().values, children } }),
    setErrors: (errors: { name?: string; dependency?: string }) => set({ errors: { ...get().errors, ...errors } }),
    clearErrors: () => set({ errors: undefined }),
    replaceComponentSelectOptions: [],
    setReplaceComponentSelectOptions: (options: ReplaceComponentSelectOption[]) =>
      set({ replaceComponentSelectOptions: options })
  };
});
