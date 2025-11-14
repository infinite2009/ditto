import { twMerge } from 'tailwind-merge';

/** 布局组件，用于包裹表单字段与错误信息 */
export function FormFieldErrorWrapper({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={twMerge('flex-1 relative', className)}>{children}</div>;
}
