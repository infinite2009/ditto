import { Button, Dropdown, Typography } from 'antd';
import { observer } from 'mobx-react';
import { useContext, useEffect, useState } from 'react';
import classNames from 'classnames';
import { nanoid } from 'nanoid';
import { DSLStoreContext, EditorStoreContext } from '@/hooks/context';
import { More, Ok, ResolveCheck, Trash } from '@/components/icon';
import { CommentInfo } from '@/service/db-store';
import EllipsisText from '@/pages/editor/ellipsis-text';

import styles from './index.module.less';

const CommentList = observer(() => {
  const [showResolved, setShowResolved] = useState<boolean>(true);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [key, setKey] = useState<string>(nanoid());
  const [ellpsis, setEllipsis] = useState<Record<string, any>>({
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

  function resolveComment(comment: CommentInfo) {}

  function deleteComment(comment: CommentInfo) {}

  function renderComponentName(componentId: string) {
    const component = dslStore.fetchComponentInDSL(componentId);
    if (!component) {
      return '未知组件';
    }
    return component.displayName;
  }

  function renderCommentList() {
    const commentList = editorStore.commentList;
    return commentList.map(item => {
      return (
        <div className={styles.comment}>
          {expanded[item.id] ? (
            <Typography.Paragraph className={styles.commentContent} ellipsis={false}>
              {item.content}
              <Button
                type="link"
                onClick={() => {
                  setExpanded({
                    ...expanded,
                    [item.id]: false
                  });
                  setEllipsis({ ...ellpsis });
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
                ...ellpsis,
                onExpand: () => {
                  setExpanded({
                    ...expanded,
                    [item.id]: true
                  });
                }
              }}
            >
              {item.content}
            </Typography.Paragraph>
          )}

          <div className={styles.commentFooter}>
            <span className={styles.updateTime}>3秒前</span>
            <EllipsisText className={styles.componentName} text={renderComponentName(item.componentId)} />
            <div className={styles.commentActionBtnWrapper}>
              <ResolveCheck className={styles.icon} onClick={() => resolveComment(item)} />
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
    const iconClass = classNames({
      [styles.icon]: true,
      [styles.opacity]: showResolved
    });
    return {
      items: [
        {
          key: '1',
          label: (
            <div className={styles.resolvedTitleWrapper}>
              <span className={styles.resolvedTitle}>显示已解决的评论</span>
              <Ok className={iconClass} />
            </div>
          )
        }
      ],
      onClick: toggleResolved
    };
  }

  return (
    <div>
      <div className={styles.header}>
        <span className={styles.headerTitle}>评论 {editorStore.commentList?.length || ''}</span>
        <Dropdown menu={renderResolvedOption()}>
          <More className={styles.icon} />
        </Dropdown>
      </div>
      <div className={styles.commentList}>{renderCommentList()}</div>
    </div>
  );
});

export default CommentList;
