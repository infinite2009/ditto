import React, { CSSProperties, useContext, useEffect, useMemo, useState } from 'react';
import { observer } from 'mobx-react';
import classNames from 'classnames';
import { Button, Input, message } from 'antd';
import { EditorStoreContext } from '@/hooks/context';
import NewFileManager from '@/service/new-file-manager';
import { EditPencil, ResolveCheck } from '@/components/icon';

import styles from './index.module.less';
import { relativeTimeFormat } from '@/util';
import { CommentInfo } from '@/service/db-store';

export interface ICommentProps {
  onSave?: () => void;
  componentId: string;
  onClose?: () => void;
  position?: { top: number; left: number };
  initContent?: string;
  commentInfo?: CommentInfo;
}

type Position = { top: number; left: number };

/**
 * TODO: 这个组件的设计非常糟糕，还没有想好怎么重构
 */
const CommentEditor = observer(({ componentId, onSave, onClose, position, commentInfo }: ICommentProps) => {
  const [content, setContent] = useState('');
  const [currentPosition, setCurrentPosition] = useState<Position>(null);
  const [contentExtended, setContentExtended] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [lastPosition, setLastPosition] = useState<Position>(null);

  const editorStore = useContext(EditorStoreContext);

  useEffect(() => {
    setContent(commentInfo?.content || '');
    if (!commentInfo) {
      setIsEditing(true);
    } else {
      setIsEditing(false);
    }
  }, [commentInfo]);

  useEffect(() => {
    if (componentId !== editorStore.componentIdForComment) {
      setIsEditing(false);
      setContentExtended(false);
    }
  }, [componentId, editorStore.componentIdForComment]);

  useEffect(() => {
    if (position) {
      setCurrentPosition(position);
      // 这里必须深度比较
      if (lastPosition && (lastPosition.top !== position.top || lastPosition.left !== position.left)) {
        setIsEditing(true);
      } else {
        setLastPosition(position);
      }
    }
  }, [position]);

  const mergedStyle = useMemo(() => {
    const result: CSSProperties = {
      ...currentPosition
    };
    if (isEditing || contentExtended) {
      result.zIndex = 999999;
    }
    return result;
  }, [currentPosition, isEditing, contentExtended]);

  function handleEditingContent(e) {
    setContent(e.target.value);
  }

  function cancelComment() {
    setIsEditing(false);
    setContentExtended(false);
    setCurrentPosition(lastPosition);
    if (onClose) {
      onClose();
    }
  }

  async function publishComment() {
    if (!content) {
      message.success('请输入评论');
      return;
    }

    if (commentInfo) {
      await NewFileManager.updateComment({
        id: commentInfo.commentId,
        content,
        resolved: false,
        position_top: currentPosition.top,
        position_left: currentPosition.left
      });
      if (onSave) {
        onSave();
      }
    } else {
      await NewFileManager.createComment({
        comment: content,
        pageId: editorStore.selectedPageId,
        top: currentPosition?.top || 0,
        left: currentPosition?.left || 0,
        componentId: editorStore.componentIdForComment
      });
      if (onSave) {
        onSave();
      }
    }
    cancelComment();
  }

  function handleMouseEnter(e) {
    e.stopPropagation();
    setContentExtended(true);
    editorStore.setComponentIdForComment(componentId);
  }

  function handleMouseLeave(e) {
    e.stopPropagation();
    if (!isEditing) {
      setContentExtended(false);
      editorStore.clearComponentIdForComment();
    }
  }

  function handleClickingContentWrapper(e) {
    e.stopPropagation();
    setContentExtended(true);
  }

  function handleSwitchingEditing() {
    setIsEditing(true);
    setContentExtended(false);
    editorStore.setComponentIdForComment(componentId);
  }

  async function resolveComment() {
    await NewFileManager.updateComment({ id: commentInfo.commentId, resolved: true });
    const commentList = await NewFileManager.fetchCommentList(editorStore.selectedPageId);
    editorStore.setCommentList(commentList);
  }

  function renderInput() {
    if (componentId !== editorStore.componentIdForComment) {
      return null;
    }
    const className = classNames({
      [styles.withContent]: !!content,
      [styles.textArea]: true
    });

    const textBtnClass = classNames({
      [styles.btn]: true,
      [styles.textBtn]: true
    });

    const primaryBtnClass = classNames({
      [styles.btn]: true,
      [styles.primaryBtn]: true
    });
    return (
      <div className={styles.inputWrapper} onClick={e => e.stopPropagation()}>
        <Input.TextArea
          className={className}
          value={content}
          rows={6}
          placeholder="请输入评论内容"
          onChange={handleEditingContent}
        />
        <div className={styles.buttonWrapper}>
          <Button className={textBtnClass} type="text" onClick={cancelComment}>
            取消
          </Button>
          <Button className={primaryBtnClass} type="primary" onClick={publishComment}>
            发布
          </Button>
        </div>
      </div>
    );
  }

  function renderContentAndToolbar() {
    if (!contentExtended || !commentInfo) {
      return null;
    }
    return (
      <div className={styles.contentArea}>
        <div className={styles.contentToolbar}>
          <span className={styles.time}>{relativeTimeFormat(commentInfo.mtime)}</span>
          <div className={styles.btnWrapper}>
            <EditPencil className={styles.icon} onClick={handleSwitchingEditing} />
            <ResolveCheck className={styles.icon} onClick={resolveComment} />
          </div>
        </div>
        <span>{commentInfo?.content}</span>
      </div>
    );
  }

  // return commentInfo ? renderCommentContent() : showInput ? renderCommentInput() : null;
  return (
    <div
      className={styles.commentWrapper}
      style={mergedStyle}
      onClick={handleClickingContentWrapper}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className={styles.iconBtn} />
      {isEditing ? renderInput() : renderContentAndToolbar()}
    </div>
  );
});

export default CommentEditor;
