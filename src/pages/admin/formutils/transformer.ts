/**
 * 转换器
 */

import { FormAtomField, FormField, FormFieldSymbol, FormModel, FormModelValues } from './types';
import { create } from 'zustand';

function formField<T extends FormAtomField>(notify: () => void, value: T): FormField<T> {
  const ref = {
    current: value,
    error: null as string | null,
    visible: true,
    disabled: false
  };
  return {
    [FormFieldSymbol]: true,
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
    },
    show: () => {
      ref.visible = true;
      notify();
    },
    hide: () => {
      ref.visible = false;
      notify();
    },
    disable: () => {
      ref.disabled = true;
      notify();
    },
    enable: () => {
      ref.disabled = false;
      notify();
    }
  };
}

function formModel<Data extends object>(notify: () => void, data: Data): FormModel<Data> {
  return Object.fromEntries(
    Object.entries(data).map(([key, value]) => {
      if (Array.isArray(value)) {
        // 处理数组
        return [
          key,
          value.map(item =>
            typeof item === 'object' && item !== null
              ? formModel(notify, item)
              : formField(notify, item as FormAtomField)
          )
        ];
      } else if (typeof value === 'object' && value !== null) {
        // 处理嵌套对象
        return [key, formModel(notify, value)];
      } else {
        // 处理基本类型
        return [key, formField(notify, value as FormAtomField)];
      }
    })
  ) as FormModel<Data>;
}

export function formModelValues<F extends FormModel<any>>(model: F): FormModelValues<F> {
  return Object.fromEntries(
    Object.entries(model).map(([key, value]) => {
      if (Array.isArray(value)) {
        // TODO 这里暂时没有考虑数组元素为原始值的情况
        // 处理数组
        return [key, value.map(item => formModelValues(item as FormModel<any>))];
      } else if (typeof value === 'object' && value !== null && !(FormFieldSymbol in value)) {
        // 处理嵌套对象
        return [key, formModelValues(value as FormModel<any>)];
      } else {
        return [key, (value as FormField<FormAtomField>).get()];
      }
    })
  ) as FormModelValues<F>;
}

/**
 * 创建表单模型
 * @param notify 通知函数 每当表单的值或属性发生变化时, 会调用通知函数
 * @param data 数据
 * @returns 表单模型和获取表单值的函数
 */
export function createFormModel<Data extends object>(notify: () => void, initialData: Data) {
  const model = formModel(notify, initialData);
  const getValues = () => formModelValues(model);
  return [model, getValues] as const;
}

/**
 * 创建表单模型并使用 Zustand 管理
 * @param initialData 初始数据
 * @returns 表单模型和获取表单值的函数
 */
export function createFormModelWithZustand<Data extends object>(initialData: Data | null) {
  let notify: () => void;
  const selector = create<Data>(set => {
    notify = () => set({});
    return initialData;
  });

  // 如果初始数据为 null, 则在 selector setState 时创建表单模型
  if (initialData === null) {
    const current = {
      modal: null as FormModel<Data>,
      getValues: () => null as Data
    };
    selector.setState = (data: Data | null) => {
      if (data === null) {
        current.modal = null;
        current.getValues = () => null;
      } else {
        const [model, getValues] = createFormModel(notify, data);
        current.modal = model;
        current.getValues = getValues as () => Data;
      }
      notify();
    };

    return [selector, () => current.modal, () => current.getValues(), notify] as const;
  } else {
    const [model, getValues] = createFormModel(notify, initialData);
    return [selector, () => model, getValues as () => Data, notify] as const;
  }
}
