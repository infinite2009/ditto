import { ReactNode } from 'react';

export interface IPageRootProps {
  children: ReactNode;
}

export default function PageRoot({ children }: IPageRootProps) {
  return <div>{children}</div>;
}
