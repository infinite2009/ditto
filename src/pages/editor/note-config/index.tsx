import { observer } from 'mobx-react';
import styles from './index.module.less';
import { Button, Card, Divider, message, Space } from 'antd';
import { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { RichEditor } from '@bilibili/ee-components';
import { NoteItem } from '@/service/editor-store';
import NewFileManager from '@/service/new-file-manager';
import { EditorStoreContext } from '@/hooks/context';
import { RichEditorOptions } from './config';
import { isNil } from 'lodash';
import { postVoltronNoteCreate, postVoltronNoteDelete, postVoltronNoteUpdate } from '@/api';

interface NoteConfigProps {
  pageId: string;
  componentId: string;
  dataSource?: NoteItem[];
}

const isEmpty = (val: unknown) => {
  return isNil(val) || val === '';
};

export default observer(function NoteConfig({ pageId, componentId }: NoteConfigProps) {
  const [messageApi, contextHolder] = message.useMessage();
  const editorStore = useContext(EditorStoreContext);

  const dataSource = useMemo(() => {
    return editorStore.noteList.filter(i => i.componentId === componentId);
  }, [editorStore.noteList, componentId]);

  const [loading, setLoading] = useState(false);
  const originValue = useRef<string>();
  const richEditorRef = useRef<HTMLDivElement>(null);
  const [current, setCurrent] = useState<NoteItem>();
  const [showEditor, setShowEditor] = useState(false);
  const [changeSymbol, setChangeSymbol] = useState(Symbol());

  const isNoteChange = useMemo(() => {
    return current?.noteData === originValue.current || (isEmpty(current?.noteData) && isEmpty(originValue?.current));
  }, [originValue, current, loading, changeSymbol]);

  const onCreateNote = async () => {
    setLoading(true);
    await postVoltronNoteCreate({
      pageId,
      componentId,
      noteData: current.noteData
    });
    message.success('保存成功');
    originValue.current = current.noteData;
    setLoading(false);
    await editorStore.getNoteList();
    setShowEditor(false);
  };

  const onUpdateNote = async () => {
    setLoading(true);
    await postVoltronNoteUpdate({
      id: current.id,
      noteData: current.noteData
    });
    message.success('保存成功');
    originValue.current = current.noteData;
    setLoading(false);
    await editorStore.getNoteList();
    setShowEditor(false);
  };

  const onCancel = () => {
    setShowEditor(false);
  };

  const onAdd = () => {
    setShowEditor(true);
    setCurrent(undefined);
    originValue.current = undefined;
    setChangeSymbol(Symbol());
    setTimeout(() => {
      // 此处的代码会在下一次重绘前执行
      richEditorRef.current?.scrollIntoView({
        block: 'center',
        behavior: 'smooth'
      });
    }, 300);
  };

  const onEdit = (item: NoteItem) => {
    setShowEditor(true);
    setCurrent(item);
    originValue.current = item.noteData;
    setChangeSymbol(Symbol());
  };

  const onDelete = async (id: number) => {
    await postVoltronNoteDelete({ id });
    message.success('删除成功');
    editorStore.getNoteList();
  };

  useEffect(() => {
    if (!editorStore.isFetchingNoteList && !dataSource?.length) {
      onAdd();
    } else {
      onCancel();
    }
  }, [componentId, pageId, editorStore.isFetchingNoteList]);

  return (
    <div className={styles['wrapper']}>
      {contextHolder}
      <div className={styles['note-list']}>
        {dataSource.map(i => {
          return showEditor && current?.id === i.id ? (
            <div key={i.id}>
              <RichEditor
                value={current?.noteData}
                placeholder="请输入批注信息"
                onChange={val => {
                  setCurrent({
                    ...current,
                    noteData: val
                  });
                }}
                maxLength={60000}
                initOptions={RichEditorOptions}

              ></RichEditor>
              <Space style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 24 }}>
                <Button
                  size="small"
                  type="primary"
                  disabled={isNoteChange}
                  loading={loading}
                  onClick={e => {
                    onUpdateNote();
                  }}
                >
                  保存
                </Button>
                <Button
                  size="small"
                  onClick={e => {
                    onCancel();
                  }}
                >
                  取消
                </Button>
              </Space>
            </div>
          ) : (
            <Card
              key={i.id}
              className={styles['note-item']}
              extra={
                <Space>
                  <a href="#" onClick={e => onEdit(i)}>
                    编辑
                  </a>
                  <a href="#" onClick={e => onDelete(i.id)}>
                    删除
                  </a>
                </Space>
              }
            >
              <div dangerouslySetInnerHTML={{ __html: i.noteData }}></div>
            </Card>
          );
        })}
      </div>
      <Divider></Divider>
      {!showEditor && (
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            size="small"
            type="primary"
            onClick={e => {
              onAdd();
            }}
          >
            新增批注
          </Button>
        </div>
      )}
      <div ref={richEditorRef}>
        {showEditor && !current?.id && (
          <>
            <RichEditor
              value={current?.noteData}
              placeholder="请输入批注信息"
              initOptions={RichEditorOptions}
              maxLength={60000}
              onChange={val => {
                setCurrent({
                  ...current,
                  noteData: val
                });
              }}
            ></RichEditor>
            <Space style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                size="small"
                type="primary"
                disabled={isNoteChange}
                loading={loading}
                onClick={e => {
                  onCreateNote();
                }}
              >
                添加
              </Button>
              <Button
                size="small"
                onClick={e => {
                  onCancel();
                }}
              >
                取消
              </Button>
            </Space>
          </>
        )}
      </div>
    </div>
  );
});
