import { forwardRef, PropsWithChildren, useContext, useEffect, useImperativeHandle, useRef, useState } from 'react';
import styles from './index.module.less';
import { Button } from 'antd';
import { AimOutlined } from '@ant-design/icons';
import { macMouseWheel } from './mousewheel';
import Hammer from 'hammerjs';
import { EditorStoreContext } from '@/hooks/context';
import { observer } from 'mobx-react';
import { useUpdateEffect } from 'ahooks';
import classNames from 'classnames';
import useIframeStore from '@/iframe/store';

export type InfiniteContainerProps = {
  // 开启画布
  openDrawer?: boolean;
  showPointer?: boolean;
  pageWidth: number;
  scale?: number;
  origin?: React.CSSProperties['transformOrigin'];
  stopWheel?: (e: WheelEvent) => boolean;
};

export interface InfiniteContainerHandle {
  reset: () => void;
}

const InfiniteContainer = forwardRef<InfiniteContainerHandle, PropsWithChildren<InfiniteContainerProps>>(
  (props, ref) => {
    const editorStore = useContext(EditorStoreContext);
    const { iframe } = useIframeStore();
    const {
      children,
      pageWidth,
      stopWheel,
      scale = 100,
      origin = 'center',
      showPointer = true,
      openDrawer = true
    } = props;
    const container = useRef<HTMLDivElement>(null);
    const content = useRef<HTMLDivElement>(null);
    const contentInner = useRef<HTMLDivElement>(null);
    const moveRatio = 1.5;
    const scaleRatio = 2.5;

    const onWheel = (e: WheelEvent) => {
      e.stopPropagation();
      if (stopWheel?.(e)) {
        return false;
      }
      e.preventDefault();
      if (e.ctrlKey) {
        let scale = editorStore.scale;
        if (e.deltaY > 0) {
          scale -= scaleRatio;
        }
        if (e.deltaY < 0) {
          scale += scaleRatio;
        }
        editorStore.setScale(scale);
        return;
      }
      const deltaX = e.deltaX;
      const deltaY = e.deltaY;
      let newTop = parseInt(content.current.style.top || '0');
      let newLeft = parseInt(content.current.style.left || '0');
      newTop -= deltaY * moveRatio;
      newLeft -= deltaX * moveRatio;
      content.current.style.left = newLeft + 'px';
      content.current.style.top = newTop + 'px';
    };

    const checkAndReset = () => {
      const left = parseInt(content.current.style.left || '0');
      if (left < -content.current.offsetWidth) {
        content.current.style.left = '0px';
      } else if (left > 0) {
        content.current.style.left = -content.current.offsetWidth + 'px';
      }
    };

    const onReset = () => {
      if (content.current) {
        content.current.style.left = '0px';
        content.current.style.top = '0px';
      }
    };

    useImperativeHandle(ref, () => ({
      reset: onReset
    }));

    const io = new MutationObserver(() => {
      const body = iframe.contentDocument.querySelector('body');
      const contentInner = document.querySelector<HTMLDivElement>('#contentInner');
      // window.body = body;
      // contentInner.style.width = `${body.scrollWidth}px`;
      contentInner.style.height = `${body.scrollHeight}px`;
      // iframe.parentElement.style.width = `${body.scrollWidth}px`;
      iframe.parentElement.style.height = `${body.scrollHeight}px`;
    });

    useEffect(() => {
      if (openDrawer && iframe?.contentDocument && container.current) {
        const body = iframe.contentDocument.querySelector('body');

        io.observe(body, {
          childList: true,
          subtree: true
        });
        container.current.addEventListener('wheel', onWheel);
        iframe.contentWindow?.addEventListener('wheel', onWheel, { passive: false });
      }
      return () => {
        if (iframe && container.current) {
          container.current?.removeEventListener('wheel', onWheel);
          iframe.contentWindow?.removeEventListener('wheel', onWheel);
          io?.disconnect();
        }
      };
    }, [openDrawer, iframe?.contentDocument]);

    return (
      <div
        ref={container}
        className={classNames({
          [styles['infinite-container']]: openDrawer
        })}
      >
        {openDrawer ? (
          <>
            {showPointer && (
              <Button className={styles['pinpoint']} onClick={onReset} shape="circle" icon={<AimOutlined />}></Button>
            )}
            <div ref={content} className={styles['content']}>
              <div
                ref={contentInner}
                className={styles['content-inner']}
                id="contentInner"
                style={{
                  minWidth: pageWidth,
                  transform: `scale(${scale / 100}) `,
                  transformOrigin: origin
                }}
              >
                {children}
              </div>
            </div>
          </>
        ) : (
          <div
            style={{
              minWidth: pageWidth,
              transform: `scale(${scale / 100}) `,
              transformOrigin: 'top left'
            }}
          >
            {children}
          </div>
        )}
      </div>
    );
  }
);

InfiniteContainer.displayName = 'InfiniteContainer';

export default observer(InfiniteContainer);
