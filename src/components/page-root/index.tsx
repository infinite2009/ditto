import { ReactNode } from 'react';
import { Flex } from 'antd';
import { observer } from 'mobx-react';
import { FlexProps } from 'antd/lib';

export interface IPageRootProps extends FlexProps {
  children: ReactNode;
}
export default observer(function PageRoot({ children, justify, align, gap, style }: IPageRootProps) {
  return (
    <Flex flex="1 0" vertical justify={justify} align={align} gap={gap} style={style}>
      {children}
    </Flex>
  );
});
