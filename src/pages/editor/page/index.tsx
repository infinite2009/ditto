import { CSSProperties, ReactNode, useMemo } from 'react';
import PageHeader from '@/pages/editor/page/page-header';
import PageMenu from '@/pages/editor/page/page-menu';
import classNames from 'classnames';

import styles from './index.module.less';
import { DesignMode } from '@/service/editor-store';

export interface IPageProps {
  children?: ReactNode[] | ReactNode;
  mode?: string;
  pageWidth?: number;
}

export default function Page({ children, pageWidth, mode }: IPageProps) {
  const composedStyle: CSSProperties = useMemo(() => {
    const result = {
      margin: pageWidth === 0 ? '0' : '0 auto'
    };
    if (mode === DesignMode.preview) {
      result['width'] = pageWidth === 0 ? 'initial' : pageWidth;
    }
    return result;
  }, [pageWidth]);

  return (
    <div
      className={classNames(
        {
          [styles.page]: true,
          [styles.fullScreenHeight]: mode === DesignMode.preview
        },
        styles[mode]
      )}
      style={composedStyle}
    >
      <PageHeader />
      <PageMenu className={classNames(styles['menu-wrapper'])}>{children}</PageMenu>
    </div>
  );
}
