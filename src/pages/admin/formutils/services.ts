import React from 'react';
import { isNil, zip } from 'ramda';
import { FormField, FormModel } from './types';
import { InputProps } from '@bilibili/voltron-design';

/** 验证指定 FormModal 的指定字段 */
export function validateMaterialField<T extends FormModel<any>>(field: keyof T, getFormModel: () => T) {
  const model = getFormModel();
  console.log('model', model);
  if (!model) {
    return false;
  }

  const fieldModel = model[field] as FormField<any>;

  if (isNil(fieldModel.get()) || fieldModel.get() === '') {
    fieldModel.setError('请填写');
    console.log('fieldModel', field, fieldModel.get(), isNil(fieldModel.get()) || fieldModel.get() === '');
    return false;
  }
  fieldModel.resetError();
  return true;
}
export function createMaterialFormOneFieldWith<
  T extends FormModel<M>,
  M extends object,
  P extends { value: M[keyof M]; onChange: (value: M[keyof M]) => void }
>(field: keyof T, getFormModel: () => T, useSelector: <V>(fn: () => V) => V, FC: React.FC<P>) {
  const FieldComponent: React.FC<Omit<P, 'value' | 'onChange'>> = props => {
    const model = getFormModel();
    const fieldModel = model[field] as FormField<any>;
    const value = useSelector(fieldModel.get);
    const handleChange = (value: M[keyof M]) => {
      fieldModel.set(value);
      validateMaterialField(field, () => model);
    };
    return React.createElement(FC, { value, onChange: handleChange, ...props } as any);
  };
  FieldComponent.displayName = `MaterialFormInputField(${field as string})`;
  return FieldComponent;
}

/** 创建 FormModal 里的一个字段 UI */
export function createMaterialFormOneField<T extends FormModel<any>>(
  field: keyof T,
  getFormModel: () => T,
  useSelector: <V>(fn: () => V) => V,
  FC: React.FC<InputProps>
) {
  const FieldComponent: React.FC<Omit<InputProps, 'onChange' | 'value'>> = props => {
    const model = getFormModel();
    const fieldModel = model[field] as FormField<any>;
    const value = useSelector(fieldModel.get);
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      fieldModel.set(e.target.value);
      validateMaterialField(field, () => model);
    };
    return React.createElement(FC, { value, onChange: handleChange, ...props });
  };
  FieldComponent.displayName = `MaterialFormInputField(${field as string})`;
  return FieldComponent;
}

/** 创建 FormModal 里的多个字段 UI */
export function createMaterialFormFields<T extends FormModel<any>>(
  keys: (keyof T)[],
  getFormDataModal: () => T,
  useSelector: <V>(fn: () => V) => V,
  FC: React.FC<InputProps>
) {
  return keys.map(field => createMaterialFormOneField(field, getFormDataModal, useSelector, FC));
}

/** 创建 FormModal 里的多个字段错误信息 UI */
export function createMaterialFormFieldErrorMessage<T extends FormModel<any>>(
  keys: (keyof T)[],
  useSelector: <V>(fn: () => V) => V,
  getFormModel: () => T
) {
  return keys.map(key => {
    const ErrorMessageForMaterialFormItem = () => {
      const model = getFormModel();
      const fieldModel = model[key] as FormField<any>;
      const error = useSelector(fieldModel.getError);
      if (!error) {
        return null;
      }
      return React.createElement('div', { className: 'text-12/18 text-red-500 absolute top-full left-0' }, error);
    };
    ErrorMessageForMaterialFormItem.displayName = `MaterialFormFieldErrorMessage(${key as string})`;
    return ErrorMessageForMaterialFormItem;
  });
}

/** 创建 FormModal 里的多个字段 UI 和错误信息 UI */
export function createMaterialFormInputAndErrorMessage<T extends FormModel<any>>(
  keys: (keyof T)[],
  useFormDataModal: () => T,
  useSelector: <V>(fn: () => V) => V,
  FC: React.FC<InputProps>
) {
  const Input = createMaterialFormFields(keys, useFormDataModal, useSelector, FC);
  const ErrorMessage = createMaterialFormFieldErrorMessage(keys, useSelector, useFormDataModal);
  return zip(Input, ErrorMessage);
}
