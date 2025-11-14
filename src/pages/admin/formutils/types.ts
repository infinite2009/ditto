/** 表单模型的原子字段类型 */
export type FormAtomField = string | number | boolean | null | undefined;

export const FormFieldSymbol = Symbol('FormField');

export type FormField<T extends FormAtomField> = {
  [FormFieldSymbol]: true;
  /** 获取字段值 */
  get(): T;
  /** 获取字段错误 */
  getError(): string | null;
  /** 设置字段值 */
  set(value: T): void;
  /** 设置字段错误 */
  setError(error: string): void;
  /** 重置字段错误 */
  resetError(): void;
  /** 显示字段 */
  show(): void;
  /** 隐藏字段 */
  hide(): void;
  /** 禁用字段 */
  disable(): void;
  /** 启用字段 */
  enable(): void;
};

export type FormModel<F extends object> = {
  [K in keyof F]: F[K] extends object
    ? FormModel<F[K]>
    : F[K] extends Array<infer T>
    ? T extends object
      ? FormModel<T>[]
      : T extends FormAtomField
      ? FormField<T>[]
      : never
    : F[K] extends FormAtomField
    ? FormField<F[K]>
    : never;
};

export type FormModelValues<F extends FormModel<any>> = {
  [K in keyof F]: F[K] extends FormField<infer T>
    ? T
    : F[K] extends FormModel<any>
    ? FormModelValues<F[K]>
    : F[K] extends Array<infer T>
    ? T extends FormModel<any>
      ? FormModelValues<T>[]
      : T extends FormField<infer U>
      ? U[]
      : never
    : never;
};
