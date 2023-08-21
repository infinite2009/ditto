import { ReactNode } from 'react';
import { message } from 'antd';

export interface IDraggableComponentItemProps {
  name: string;
  children: ReactNode;
}

interface DropResult {
  allowedDropEffect: string;
  dropEffect: string;
  name: string;
}

export default function DraggableComponentItem({ name, children }: IDraggableComponentItemProps) {


  return children ? (
    <div>
      {children}
    </div>
  ) : null;
}
