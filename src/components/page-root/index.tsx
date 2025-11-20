import { ForwardedRef, forwardRef, ReactNode, useContext, useEffect, useRef } from 'react';
import { observer } from 'mobx-react';
import { FlexProps } from 'antd/lib';
import classNames from 'classnames';
import { DSLStoreContext, EditorStoreContext } from '@/hooks/context';
import useCustomProps from '@/hooks/useCustomProps';
import styles from './index.module.less';
import { DesignMode } from '@/service/editor-store';
import useMergeRefs from '@/hooks/useMergeRefs';

export interface IPageRootProps extends FlexProps {
  children: ReactNode;
}

const PageRootInner = forwardRef(({ children, style, ...otherProps }: IPageRootProps, ref: ForwardedRef<HTMLElement>) => {
  const editorStore = useContext(EditorStoreContext);
  const dslStore = useContext(DSLStoreContext);
  const pageRootRef = useRef<HTMLDivElement>(null);
  const mergedRef = useMergeRefs(pageRootRef, ref);
  const componentId = 'PageRoot0';

  const customProps = useCustomProps(otherProps);

  useEffect(() => {
    Promise.resolve().then(() => {
      dslStore.setComponentsRef(componentId, pageRootRef);
    });
    return () => {
      dslStore.setComponentsRef(componentId, undefined);
    };
  }, [dslStore.currentPageId]);

  useEffect(() => {
    if (dslStore.selectedComponent?.id && editorStore.pageConfig.open) {
      editorStore.setPageConfig(false);
    }
  }, [dslStore.selectedComponent?.id]);

  useEffect(() => {
    if (editorStore.mode === DesignMode.edit) {
      document.body.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      document.body.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  function findComponentRoot(dom: HTMLElement) {
    let node = dom;
    while (node) {
      if (node.dataset) {
        const { voltronComponent } = node.dataset;
        if (voltronComponent) {
          return node;
        }
      }
      node = node.parentNode as HTMLElement;
    }
  }

  function handleMouseUp(e) {
    if (e.button !== 0) {
      return;
    }
    editorStore.setPageConfig(false);
    const componentRoot = findComponentRoot(e.target as HTMLElement);
    const { voltronId } = componentRoot?.dataset || {};
    if (voltronId) {
      editorStore.setHoveredComponentId(null);
      if (!editorStore.componentDraggingInfo) {
        dslStore.selectComponent(voltronId);
      }
    }
  }

  return (
    <div
      {...customProps}
      className={classNames(styles.pageRoot, styles[editorStore.mode])}
      id={componentId}
      ref={mergedRef}
      onMouseUp={editorStore.mode === DesignMode.preview ? null : handleMouseUp}
      style={style}
    >
      {children}
    </div>
  );
});

PageRootInner.displayName = 'PageRootInner';

const PageRoot = observer(PageRootInner);
PageRoot.displayName = 'PageRoot';

export default PageRoot;
