import { Dropdown, Input } from 'antd';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { ExpandDown } from '@/components/icon';
import classNames from 'classnames';
import { observer } from 'mobx-react';
import { AppStoreContext, EditorStoreContext } from '@/hooks/context';
import { sceneMap, Scene } from '@/service/app-store';

import styles from './index.module.less';
import { useMemoizedFn } from 'ahooks';

export interface IZoomProps {
  onZoom: (data: number) => void;
  defaultValue: number;
}

const steps = [6, 12, 25, 50, 100, 200, 400, 800];
const maxZoomScale = steps[steps.length - 1];
const minZoomScale = steps[0];

export default observer(function ZoomSelect({ onZoom }: IZoomProps) {
  const [zoomValue, setZoomValue] = useState<number>(100);
  // const [lock, setLock] = useState<boolean>(true);
  const lock = useRef(true);

  const [open, setOpen] = useState<boolean>(false);
  const [inputValue, setInputValue] = useState<number>(100);

  const appStore = useContext(AppStoreContext);
  const editorStore = useContext(EditorStoreContext);

  useEffect(() => {
    const handlers = {
      zoomIn,
      zoomOut,
      zoomTo100
    };
    // 注册相应模式下的快捷键
    appStore.registerHandlers(sceneMap[editorStore.mode], handlers);
  }, [editorStore.mode]);

  useEffect(() => {
    console.log('lock.current', lock.current);
    if (lock.current) return;
    lock.current = true;
    if (onZoom) {
      onZoom(zoomValue);
    }
    setInputValue(zoomValue);
  }, [zoomValue]);

  useEffect(() => {
    setInputValue(editorStore.scale);
    setZoomValue(editorStore.scale);
  }, [editorStore.scale]);

  function handleInputting(e) {
    const value = e.target.value.replace(/\D/g, '');
    setInputValue(value);
    e.stopPropagation();
  }

  const zoomIn = useMemoizedFn(() => {
    const corrected = correctZoomValue(zoomValue * 2);
    setZoomValue(corrected);
  });

  const zoomOut = useMemoizedFn(() => {
    const corrected = correctZoomValue(Math.floor(zoomValue / 2));
    setZoomValue(corrected);
  });

  const zoomTo100 = useMemoizedFn(() => {
    setZoomValue(100);
  });

  function generateMenuItems() {
    const { zoomIn, zoomOut, zoomTo100 } = appStore.shortKeyDict[Scene.editor];
    return [
      {
        key: 'zoomInput',
        label: (
          <p className={styles.zoomInput}>
            <Input value={inputValue} onInput={handleInputting} onPressEnter={handlePressingEnter} />
            <span>%</span>
          </p>
        )
      },
      {
        key: 'zoomIn',
        label: (
          <p className={styles.dropDownItem}>
            <span>{zoomIn.functionName}</span>
            <span className={styles.shortcut}>{appStore.generateShortKeyDisplayName(Scene.editor, 'zoomIn')}</span>
          </p>
        ),
        disabled: zoomValue >= maxZoomScale
      },
      {
        key: 'zoomOut',
        label: (
          <p className={styles.dropDownItem}>
            <span>{zoomOut.functionName}</span>
            <span className={styles.shortcut}>{appStore.generateShortKeyDisplayName(Scene.editor, 'zoomOut')}</span>
          </p>
        ),
        disabled: zoomValue <= minZoomScale
      },
      // {
      //   key: 'zoomToFit',
      //   label: (
      //     <p className={styles.dropDownItem}>
      //       <span>{zoomToFit.functionName}</span>
      //       <span>{appStore.generateShortKeyDisplayName(Scene.editor, 'zoomToFit')}</span>
      //     </p>
      //   )
      // },
      {
        key: 'zoomTo50',
        label: (
          <p className={styles.dropDownItem}>
            <span>调整至 50%</span>
          </p>
        )
      },
      {
        key: 'zoomTo100',
        label: (
          <p className={styles.dropDownItem}>
            <span>{zoomTo100.functionName}</span>
            <span className={styles.shortcut}>{appStore.generateShortKeyDisplayName(Scene.editor, 'zoomTo100')}</span>
          </p>
        )
      },
      {
        key: 'zoomTo200',
        label: (
          <p className={styles.dropDownItem}>
            <span>调整至 200%</span>
          </p>
        )
      }
    ];
  }

  function handlePressingEnter(e: React.KeyboardEvent<HTMLElement>) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const zoomValue = Math.max(minZoomScale, Math.min(+e.target.value.trim(), maxZoomScale));
    setZoomValue(zoomValue);
    setInputValue(zoomValue);
    setOpen(false);
    e.stopPropagation();
  }

  /**
   * 修正缩放值，使之变为阶梯状
   */
  function correctZoomValue(originVal: number) {
    for (let i = 0; i < steps.length; i++) {
      if (originVal <= steps[i]) {
        return steps[i];
      }
    }
    return steps[steps.length - 1];
  }

  function generateExpandClass() {
    return classNames({
      [styles.zoomLabel]: true,
      [styles.expanded]: open
    });
  }

  function handleClickingMenuItem({ key }) {
    setOpen(key === 'zoomInput');
    lock.current = false;
    switch (key) {
      case 'zoomInput':
        break;
      case 'zoomIn':
        zoomIn();
        break;
      case 'zoomOut':
        zoomOut();
        break;
      // case 'zoomToFit':
      case 'zoomTo100':
        zoomTo100();
        break;
      case 'zoomTo50':
        setZoomValue(50);
        break;
      case 'zoomTo200':
        setZoomValue(200);
        break;
    }
  }

  function handleOpenChange(nextOpen: boolean, info: any) {
    if (info.source === 'trigger' || nextOpen) {
      setOpen(nextOpen);
    }
  }

  return (
    <Dropdown
      onOpenChange={handleOpenChange}
      menu={{ items: generateMenuItems(), onClick: handleClickingMenuItem }}
      open={open}
      trigger={['click']}
      overlayClassName={styles.dropdownOverlay}
    >
      <div className={styles.dropdownContainer}>
        <span>{zoomValue}%</span>
        <ExpandDown className={generateExpandClass()} />
      </div>
    </Dropdown>
  );
});
