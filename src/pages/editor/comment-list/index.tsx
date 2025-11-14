import { Button, Dropdown, Typography } from 'antd';
import { observer } from 'mobx-react';
import { useContext, useEffect, useMemo, useState } from 'react';
import { nanoid } from 'nanoid';
import { DSLStoreContext, EditorStoreContext } from '@/hooks/context';
import { More, Ok, ResolveCheck, ResolvedFill, Trash } from '@/components/icon';
import { CommentInfo } from '@/service/db-store';
import EllipsisText from '@/pages/editor/ellipsis-text';

import styles from './index.module.less';
import NewFileManager from '@/service/new-file-manager';
import { relativeTimeFormat } from '@/util';
import { ComponentId } from '@/types';
import classNames from 'classnames';
import { ErrorBoundary } from 'react-error-boundary';

const CommentList = observer(() => {
  const [showResolved, setShowResolved] = useState<boolean>(false);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [key, setKey] = useState<string>(nanoid());
  const [ellipsis, setEllipsis] = useState<Record<string, any>>({
    rows: 3,
    expandable: true,
    symbol: '展开'
  });

  useEffect(() => {
    if (expanded) {
      setKey(nanoid());
    }
  }, [expanded]);

  const editorStore = useContext(EditorStoreContext);
  const dslStore = useContext(DSLStoreContext);

  const commentCount = useMemo(() => {
    return editorStore.commentList.filter(item => {
      if (showResolved) {
        return true;
      }
      return !item.resolved;
    }).length;
  }, [editorStore.commentList, showResolved]);

  async function fetchCommentList() {
    const commentList = await NewFileManager.fetchCommentList(editorStore.selectedPageId);
    editorStore.setCommentList(commentList);
  }

  async function resolveComment(comment: CommentInfo) {
    await NewFileManager.updateComment({ id: comment.commentId, resolved: true });
    fetchCommentList().then();
  }

  async function unresolvedComment(comment: CommentInfo) {
    await NewFileManager.updateComment({ id: comment.commentId, resolved: false });
    fetchCommentList().then();
  }

  async function deleteComment(comment: CommentInfo) {
    await NewFileManager.deleteComment(comment.commentId);
    fetchCommentList().then();
  }

  function renderComponentName(componentId: string) {
    const component = dslStore.fetchComponentInDSL(componentId);
    if (!component) {
      return '未知组件';
    }
    return component.displayName;
  }

  function scrollComponentToTop(id: ComponentId) {
    editorStore.setHighlightComponent(id);
  }

  function renderCommentList() {
    return editorStore.commentList
      .filter(item => {
        if (showResolved) {
          return true;
        }
        return !item.resolved;
      })
      .map(item => {
        return (
          <div key={item.commentId} className={styles.comment} onClick={() => scrollComponentToTop(item.componentId)}>
            {expanded[item.commentId] ? (
              <Typography.Paragraph className={styles.commentContent} ellipsis={false}>
                {item.content}
                <Button
                  type="link"
                  onClick={() => {
                    setExpanded({
                      ...expanded,
                      [item.commentId]: false
                    });
                    setEllipsis({ ...ellipsis });
                  }}
                >
                  收起
                </Button>
              </Typography.Paragraph>
            ) : (
              <Typography.Paragraph
                key={key}
                className={styles.commentContent}
                ellipsis={{
                  ...ellipsis,
                  onExpand: () => {
                    setExpanded({
                      ...expanded,
                      [item.commentId]: true
                    });
                  }
                }}
              >
                {item.content}
              </Typography.Paragraph>
            )}

            <div className={styles.commentFooter}>
              <span className={styles.updateTime}>{relativeTimeFormat(item.mtime)}</span>
              <ErrorBoundary fallback={<div>Ellipsis Error</div>}>
                <EllipsisText className={styles.componentName} text={renderComponentName(item.componentId)} />
              </ErrorBoundary>
              <span>{item.updater}</span>
              <div className={styles.commentActionBtnWrapper}>
                {!item.resolved ? (
                  <ResolveCheck className={styles.icon} onClick={() => resolveComment(item)} />
                ) : (
                  <ResolvedFill className={styles.resolvedIcon} onClick={() => unresolvedComment(item)} />
                )}
                <Trash className={styles.icon} onClick={() => deleteComment(item)} />
              </div>
            </div>
          </div>
        );
      });
  }

  function toggleResolved() {
    setShowResolved(!showResolved);
  }

  function renderResolvedOption() {
    return {
      items: [
        {
          key: '1',
          label: (
            <div className={styles.resolvedTitleWrapper}>
              <span className={styles.resolvedTitle}>显示已解决的评论</span>
              {showResolved ? <Ok className={styles.resolvedIcon} /> : null}
            </div>
          )
        }
      ],
      onClick: toggleResolved
    };
  }

  function renderCommentTitle() {
    if (commentCount > 0) {
      return `评论 ${commentCount}`;
    }
    if (showResolved) {
      return '暂无评论';
    }
    return '暂无未解决的评论';
  }

  return (
    <div>
      <ErrorBoundary fallback={<div>comment header</div>}>
        <div className={styles?.header}>
          <span className={styles.headerTitle}>{renderCommentTitle()}</span>
          <Dropdown menu={renderResolvedOption()}>
            <More className={styles.icon} />
          </Dropdown>
        </div>
      </ErrorBoundary>

      <div className={styles.commentList}>{renderCommentList()}</div>
    </div>
  );
});

export default CommentList;
