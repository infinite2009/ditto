import HomeMenu from '@/pages/designer/components/home-menu';
import { Divider } from 'antd';
import { Redo, Undo } from '@/components/icon';
import React, { useContext } from 'react';
import classNames from 'classnames';
import { observer } from 'mobx-react';
import { DSLStoreContext } from '@/hooks/context';

import styles from './index.module.less';
import PageAction from '@/types/page-action';

export interface LeftToolbarProps {
  onDo?: (payload: { type: PageAction }) => void;
  pageName: string;
}

function LeftToolbar({ pageName, onDo }: LeftToolbarProps) {
  const dslStore = useContext(DSLStoreContext);

  function handleUndo() {
    onDo?.({
      type: PageAction.undo
    });
  }

  function handleRedo() {
    onDo?.({
      type: PageAction.redo
    });
  }

  function calClassNames(disabled: boolean) {
    return classNames({
      [styles.icon]: true,
      [styles.disabled]: disabled
    });
  }

  function handleOnDo(data: { type: PageAction }) {
    onDo?.(data);
  }

  return (
    <div className={styles.leftToolbar}>
      <HomeMenu onDo={handleOnDo}/>
      <Divider className={styles.divider} type="vertical" />
      <div className={styles.pageName}>{pageName}</div>
      <Divider className={styles.divider} type="vertical" />
      <div className={styles.redoAndUndo}>
        <Undo className={calClassNames(!dslStore.canUndo)} onClick={handleUndo} />
        <Redo className={calClassNames(!dslStore.canRedo)} onClick={handleRedo} />
      </div>
    </div>
  );
}

LeftToolbar.displayName = 'LeftToolbar';

export default observer(LeftToolbar);