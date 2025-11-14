import React from 'react';
import { Header } from './header';

export function PageLayout(props: React.PropsWithChildren<React.HTMLAttributes<HTMLDivElement>>) {
  return (
    <div className="w-screen h-screen flex flex-col" {...props}>
      <Header />
      {props.children}
    </div>
  );
}
