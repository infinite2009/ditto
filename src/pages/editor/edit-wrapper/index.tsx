import { ReactNode } from 'react';
export interface IEditorWrapper {
  name: string;
  children: ReactNode;
}

export default function EditWrapper({ name, children }: IEditorWrapper) {


  // drop(divRef);

  return children ? (
    null
  ) : <div>无效的组件</div>;
}
