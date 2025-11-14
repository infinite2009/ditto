import { DSLStoreContext, EditorStoreContext } from '@/hooks/context';
import { observer } from 'mobx-react';
import React, { cloneElement, CSSProperties, ReactNode, useContext, useEffect, useRef, useState } from 'react';

import styles from './index.module.less';
import CommentEditor from '../comment-editor';
import NewFileManager from '@/service/new-file-manager';
import { CommentInfo } from '@/service/db-store';

export interface ICommentWrapperProps {
  children: ReactNode;
  childrenStyle: CSSProperties;
  componentId: string;
}

const CommentWrapper = observer(({ childrenStyle, componentId, children }: ICommentWrapperProps) => {
  const [styleState, setStyleState] = useState<CSSProperties>({});
  const [commentOpen, setCommentOpen] = useState<boolean>(false);
  const [commentPosition, setCommentPosition] = useState<{ top: number; left: number }>(null);
  const [commentInfo, setCommentInfo] = useState<CommentInfo>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  const editorStore = useContext(EditorStoreContext);
  const dslStore = useContext(DSLStoreContext);

  useEffect(() => {
    if (editorStore.highlightComponent === componentId && containerRef.current) {
      if (dslStore.isHiddenOrInHiddenAncestor(componentId)) {
        return;
      }
      containerRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [editorStore.highlightComponent]);

  useEffect(() => {
    setStyleState(processBFC());
  }, [componentId, childrenStyle]);

  useEffect(() => {
    const commentInfo = editorStore.fetchCommentByComponentId(componentId);
    setCommentInfo(commentInfo);
  }, [componentId, editorStore.commentList]);

  useEffect(() => {
    if (commentInfo) {
      setCommentOpen(true);
      setCommentPosition({
        top: commentInfo.positionTop || 0,
        left: commentInfo.positionLeft || 0
      });
    } else {
      setCommentOpen(false);
    }
  }, [commentInfo]);

  function processBFC(): CSSProperties {
    const result: CSSProperties = {};
    const styleNames: (keyof CSSProperties)[] = [
      'display',
      'height',
      'width',
      'maxWidth',
      'maxHeight',
      'minWidth',
      'minHeight',
      'position',
      'top',
      'right',
      'bottom',
      'left',
      'inset',
      'flexGrow',
      'flexShrink',
      'alignSelf'
    ];
    styleNames.forEach(name => {
      if (childrenStyle?.[name] !== undefined) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        result[name] = childrenStyle[name];
      }
    });

    const wrapperElement = document.getElementById(componentId);
    if (!wrapperElement) {
      return result;
    }
    const childElement: HTMLElement = wrapperElement.children?.[0] as HTMLElement;
    if (!childElement) {
      return result;
    }

    const computedChildStyle = getComputedStyle(childElement);

    const marginStyleNames: (keyof CSSProperties)[] = [
      'margin',
      'marginTop',
      'marginRight',
      'marginBottom',
      'marginLeft'
    ];
    marginStyleNames.forEach(name => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      if (result[name] === undefined && computedChildStyle[name] !== '') {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        result[name] = computedChildStyle[name];
      }
    });
    childElement.style.margin = '0px';

    if (!result.display) {
      const display = computedChildStyle.getPropertyValue('display');
      const width = computedChildStyle.getPropertyValue('width');
      const flexBasis = childElement.style.flexBasis;
      const flexReg = /^-?\d+(\.\d+)?$/;
      switch (display) {
        case 'block':
          // 如果有具体宽度
          if (width.indexOf('px') !== -1 && width.indexOf('%') !== -1 && flexReg.test(width)) {
            result.display = 'inline-block';
          } else {
            result.display = 'block';
          }
          break;
        case 'flex':
          if (
            (flexBasis.indexOf('px') !== -1 && flexBasis.indexOf('%') !== -1 && flexReg.test(flexBasis)) ||
            (width.indexOf('px') !== -1 && width.indexOf('%') !== -1 && flexReg.test(width))
          ) {
            result.display = 'inline-block';
          } else {
            result.display = 'block';
          }
          break;
        default:
          result.display = display || 'inline-block';
          break;
      }
    }

    if (result.display === 'flex') {
      childElement.style.flexGrow = '1';
    }

    // if (result.display === 'inline') {
    // TODO: sky - avatar组件宽度不能设置100%，会导致设置size后的宽度不生效，这里先注释掉
    // childElement.style.width = '100%';
    // childElement.style.height = '100%';

    childElement.style.maxWidth = '100%';
    // childElement.style.maxHeight = '100%';
    childElement.style.minWidth = '0%';
    // childElement.style.minHeight = '0%';
    // }

    // 处理定位问题
    if (!result.position) {
      if (childElement.style.position === 'absolute') {
        result.position = childElement.style.position;
      }
    }
    if (!result.top && childElement.style.top !== '') {
      result.top = childElement.style.top;
      childElement.style.top = '0px';
    }

    if (!result.right && childElement.style.right !== '') {
      result.right = childElement.style.right;
      childElement.style.right = '0px';
    }

    if (!result.bottom && childElement.style.bottom !== '') {
      result.bottom = childElement.style.bottom;
      childElement.style.bottom = '0px';
    }

    if (!result.left && childElement.style.left !== '') {
      result.left = childElement.style.left;
      childElement.style.left = '0px';
    }

    return {
      ...result
    } as CSSProperties;
  }

  function showComment(e: { stopPropagation: () => void; pageY: number; pageX: number }) {
    e.stopPropagation();
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setCommentPosition({
        top: Math.abs(e.pageY - rect.top),
        left: Math.abs(e.pageX - rect.left)
      });
      editorStore.setComponentIdForComment(componentId);
      setCommentOpen(true);
    }
  }

  async function handleOnSave() {
    setCommentOpen(false);
    const commentList = await NewFileManager.fetchCommentList(editorStore.selectedPageId);
    editorStore.setCommentList(commentList);
  }

  function handleCloseComment() {
    if (!commentInfo) {
      setCommentOpen(false);
    }
  }

  return (
    <div id={componentId} ref={containerRef} className={styles.commentWrapper} onClick={showComment} style={styleState}>
      {cloneElement(children, {compid: componentId})}
      {commentOpen ? (
        <CommentEditor
          commentInfo={commentInfo}
          componentId={componentId}
          onSave={handleOnSave}
          onClose={handleCloseComment}
          position={commentPosition}
        />
      ) : null}
      {/*{editorStore.highlightComponent === componentId ? <SelectBorder /> : null}*/}
    </div>
  );
});

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
export default CommentWrapper;
