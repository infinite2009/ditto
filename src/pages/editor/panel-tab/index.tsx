import { CSSProperties, useContext, useEffect, useMemo } from 'react';
import classNames from 'classnames';
import { observer } from 'mobx-react';
import { Menu, PlayList } from '@/components/icon';
import { EditorStoreContext } from '@/hooks/context';

import styles from './index.module.less';
import { DesignMode } from '@/service/editor-store';

export interface IPanelTabProps {
  onSelect: (type: PanelType) => void;
  style?: CSSProperties;
  type: PanelType;
}

export enum PanelType {
  file,
  component,
  editorStore
}

export default observer(function PanelTab({ onSelect, type = PanelType.file }: IPanelTabProps) {

  const editorStore = useContext(EditorStoreContext);

  useEffect(() => {
    if (editorStore.mode === DesignMode.comment) {
      togglePanel(PanelType.file);
    }
  }, [editorStore.mode]);

  function togglePanel(panelType: PanelType) {
    if (onSelect) {
      onSelect(panelType);
    }
  }

  const fileBtnClassNames = useMemo(() => {
    return classNames({
      [styles.btn]: true,
      [styles.selected]: type === PanelType.file
    });
  }, [type]);

  const componentClassNames = useMemo(() => {
    return classNames({
      [styles.btn]: true,
      [styles.selected]: type === PanelType.component
    });
  }, [type]);

  const style = useMemo(() => {
    return editorStore?.leftPanelVisible
      ? undefined
      : {
        width: 0,
        overflow: 'hidden',
        margin: 0,
        padding: 0
      };
  }, []);

  return (
    <div
      className={styles.panelTab}
      style={style}
    >
      <button className={fileBtnClassNames} onClick={() => togglePanel(PanelType.file)}>
        <Menu className={styles.tabIcon} />
      </button>
      {editorStore.mode === DesignMode.comment ? null : (
        <button className={componentClassNames} onClick={() => togglePanel(PanelType.component)}>
          <PlayList className={styles.tabIcon} />
        </button>
      )}
    </div>
  );
});
