import { useState } from 'react';
import { useAdminPageStore } from './store/store';
import { AdminPageStore, FormField, FormModel, FormModelValues } from './types';

export function createBooleanSetter(fn: (value: boolean) => void) {
  return {
    setTrue: () => fn(true),
    setFalse: () => fn(false)
  };
}

export function createStoreBooleanSetter(selector: (store: AdminPageStore) => (value: boolean) => void) {
  return {
    setTrue: () => selector(useAdminPageStore.getState())(true),
    setFalse: () => selector(useAdminPageStore.getState())(false)
  };
}

export function uncontrolled<T>(
  FC: React.FC<T & { visible: boolean; setVisible: (visible: boolean) => void }>,
  defaultVisible = true
): React.FC<Omit<T, 'visible' | 'setVisible'>> {
  return function Uncontrolled(props: T) {
    const [visible, setVisible] = useState(defaultVisible);
    return (
      <FC
        visible={visible}
        setVisible={v => {
          setVisible(v);
        }}
        {...props}
      />
    );
  };
}

function formField<T>(value: T, notify: () => void): FormField<T> {
  const ref = {
    current: value,
    error: null
  };
  return {
    get: () => ref.current,
    set: (value: T) => {
      ref.current = value;
      notify();
    },
    getError: () => ref.error,
    setError: (error: string) => {
      ref.error = error;
      notify();
    },
    resetError: () => {
      ref.error = null;
      notify();
    }
  };
}

export function formModel<F extends object>(data: F, notify: () => void): FormModel<F> {
  return Object.fromEntries(
    Object.entries(data).map(([key, value]) => [key, formField(value, notify)])
  ) as FormModel<F>;
}

export function formModelValues<F extends FormModel<any>>(model: F): FormModelValues<F> {
  return Object.fromEntries(
    Object.entries(model).map(([key, value]) => [
      key,
      Array.isArray(value)
        ? value.map(formModelValues)
        : value.get()
    ])
  ) as FormModelValues<F>;
}
