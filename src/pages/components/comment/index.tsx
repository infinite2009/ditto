import { observer } from 'mobx-react';
import classNames from 'classnames';
import { Button, Input } from 'antd';
import { useContext, useState } from 'react';

import styles from './index.module.less';
import { DSLStoreContext, EditorStoreContext } from '@/hooks/context';
import { toJS } from 'mobx';

export interface ICommentProps {
  defaultContent?: string;
}

const CommentEditor = observer(({ defaultContent = '' }: ICommentProps) => {
  const [content, setContent] = useState(defaultContent);

  const editorStore = useContext(EditorStoreContext);
  const dslStore = useContext(DSLStoreContext);

  function handleEditingContent(e) {
    setContent(e.target.value);
  }

  function cancelComment() {
    editorStore.closeComment();
  }

  function renderEditor() {
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
      <div className={styles.commentContainer} style={toJS(editorStore.getCommentPosition())}>
        <Input.TextArea
          className={className}
          defaultValue={defaultContent}
          rows={6}
          placeholder="请输入评论内容"
          onChange={handleEditingContent}
        />
        <div className={styles.buttonWrapper}>
          <Button className={textBtnClass} type="text" onClick={cancelComment}>
            取消
          </Button>
          <Button className={primaryBtnClass} type="primary">
            发布
          </Button>
        </div>
      </div>
    );
  }

  return editorStore.commentOpen ? renderEditor() : null;
});

export default CommentEditor;
