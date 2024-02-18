import { observer } from 'mobx-react';
import { useContext } from 'react';
import { EditorStoreContext } from '@/hooks/context';

import styles from './index.module.less';
import { ResolveCheck, Trash } from '@/components/icon';
import { CommentInfo } from '@/service/db-store';
import EllipsisText from '@/pages/editor/ellipsis-text';

const CommentList = observer(() => {
  const editorStore = useContext(EditorStoreContext);

  function resolveComment(comment: CommentInfo) {}

  function deleteComment(comment: CommentInfo) {}

  function renderComponentName() {}

  function renderCommentList() {
    const commentList = editorStore.commentList;
    return commentList.map(item => {
      return (
        <div className={styles.comment}>
          <span className={styles.commentContent}>
            这是一段评论文案这是一段评论文案这是一段评论文案这是一段评论文案这是一段评论文案这是一段评论文案
          </span>
          <div className={styles.commentFooter}>
            <span className={styles.updateTime}>3秒前</span>
            <EllipsisText
              className={styles.componentName}
              text="所评论的组件名所评论的组件名所评论的组件名所评论的组件名所评论的组件名"
            />
            <div className={styles.commentActionBtnWrapper}>
              <ResolveCheck className={styles.icon} onClick={() => resolveComment(item)} />
              <Trash className={styles.icon} onClick={() => deleteComment(item)} />
            </div>
          </div>
        </div>
      );
    });
  }

  return (
    <div>
      <div className={styles.header}>{renderCommentList()}</div>
    </div>
  );
});

export default CommentList;
