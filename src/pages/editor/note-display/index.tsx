import { DSLStoreContext, EditorStoreContext } from '@/hooks/context';
import { Card, Space, Spin } from 'antd';
import { observer } from 'mobx-react';
import {
  CSSProperties,
  PropsWithChildren,
  useCallback,
  useContext,
  useDebugValue,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';
import styles from './index.module.less';
import NoteItem, { NoteItemProps } from './NoteItem';
import { Position } from '@xyflow/react';
import emitter from '@/util/event-emitter';
import useIframeStore from '@/iframe/store';

const baseGap = 100;
const topGap = baseGap;
const leftGap = baseGap;
const rightGap = baseGap;
const PageRootId = 'PageRoot0';

type NoteDisplayProps = {
  pageWidth: number;
};

type LayoutNoteItem = NoteItemProps['data'] & {
  top?: number;
  left?: number;
  right?: number;
  bottom?: number;
};

const Note = observer(() => {
  const { pageRoot, iframe } = useIframeStore();
  const editorStore = useContext(EditorStoreContext);
  const dslStore = useContext(DSLStoreContext);
  const displayNoteList = useMemo(() => {
    return editorStore.noteList.filter(
      i => i.pageId === dslStore?.currentPageId && dslStore.dsl?.props?.[i.componentId]
    );
  }, [editorStore?.noteList, dslStore.dsl?.props, dslStore?.currentPageId]);

  const [pageRootRect, setPageRootRect] = useState<DOMRect>(new DOMRect());

  const onResize = () => {
    setPageRootRect(pageRoot.getBoundingClientRect());
  };

  const pageRootNotes = useMemo(() => displayNoteList.filter(i => i.componentId === PageRootId), [displayNoteList]);
  const otherNotes = useMemo(() => displayNoteList.filter(i => i.componentId !== PageRootId), [displayNoteList]);

  const [leftNotes, setLeftNotes] = useState<NoteItemProps['data'][]>([]);
  const [rightNotes, setRightNotes] = useState<NoteItemProps['data'][]>([]);
  const [bottomNotes, setBottomNotes] = useState<NoteItemProps['data'][]>([]);

  const topContainerStyle: CSSProperties = useMemo(() => {
    return {
      position: 'absolute',
      top: -topGap,
      transform: 'translateY(-100%)'
    };
  }, [topGap]);

  const rightContainerStyle: CSSProperties = useMemo(() => {
    return {
      right: -rightGap,
      transform: 'translateX(100%)',
      position: 'absolute',
      top: 0
    };
  }, [rightGap]);

  const leftContainerStyle: CSSProperties = useMemo(() => {
    return {
      left: -leftGap,
      transform: 'translateX(-100%)',
      position: 'absolute',
      top: 0
    };
  }, [leftGap]);

  const onSelectNote = (item: NoteItemProps['data']) => {
    editorStore.setPageConfig(false);
    dslStore.selectComponent(item.componentId);
    editorStore.setPanelTabKey('note');
  };

  const insertHiddenRect = (rect: DOMRect, id: string) => {
    const dom = document.querySelector(`[data-ditto-hidden-id=${id}]`);
    if (dom) {
      dom.remove();
    }
    const div = document.createElement('div');
    div.style.position = 'absolute';
    div.style.top = `${rect.top}px`;
    div.style.left = `${rect.left}px`;
    div.style.width = `${rect.width}px`;
    div.style.height = `${rect.height}px`;
    // div.style.padding = `2px`;
    div.style.pointerEvents = 'none';
    // div.style.boxSizing = 'content-box';
    // div.style.border='1px solid red';
    if (id !== 'PageRoot0') {
      // div.style.background = 'rgba(255, 255, 0, 0.2)';
    }
    div.setAttribute('data-ditto-hidden-id', id);
    iframe.parentElement.appendChild(div);
  };

  useEffect(() => {
    const leftList: LayoutNoteItem[] = [];
    const rightList: LayoutNoteItem[] = [];
    const currentPageRootRect = pageRoot.getBoundingClientRect();
    insertHiddenRect(pageRoot.getBoundingClientRect(), 'PageRoot0');
    otherNotes.forEach(i => {
      const el = pageRoot.querySelector(`[data-ditto-id=${i.componentId}]`);
      if (el) {
        const { x, y, width, height, top, bottom } = el.getBoundingClientRect();
        insertHiddenRect(el.getBoundingClientRect(), i.componentId);
        // 距离左侧
        const left = x - currentPageRootRect.x;
        // 距离右侧
        const right = currentPageRootRect.width - (x - currentPageRootRect.x) - width;

        // 距离顶部
        // const top =
        const centerToTop = top + height / 2;
        if (left < right) {
          leftList.push({ ...i, top: centerToTop });
        } else {
          rightList.push({ ...i, top: centerToTop });
        }
      }
    });
    leftList.sort((a, b) => (a.top || 0) - (b.top || 0));
    rightList.sort((a, b) => (a.top || 0) - (b.top || 0));
    setLeftNotes(leftList);
    setRightNotes(rightList);
  }, [otherNotes, pageRootRect]);

  useEffect(() => {
    const ob1 = new MutationObserver(mutations => {
      if (mutations.some(i => i.type === 'childList' || (i.type === 'attributes' && i.attributeName === 'style'))) {
        onResize();
      }
    });
    const ob2 = new ResizeObserver(() => {
      onResize();
    });
    window.addEventListener('resize', onResize);
    if (pageRoot) {
      ob1.observe(pageRoot, {
        childList: true,
        subtree: true,
        attributes: true
      });
      ob2.observe(pageRoot);
    }
    onResize();
    return () => {
      ob1.disconnect();
      ob2.disconnect();
      window.removeEventListener('resize', onResize);
    };
  }, [dslStore?.currentPageId]);
  return (
    <>
      <div className={styles['note-display-top']} style={topContainerStyle}>
        <Space align="end">
          {pageRootNotes.map((i, x) => {
            return (
              <NoteItem
                key={`${dslStore?.currentPageId}_${x}`}
                data={i}
                index={x}
                placement={Position.Top}
                onClick={() => onSelectNote(i)}
              ></NoteItem>
            );
          })}
        </Space>
      </div>
      <div className={styles['note-display-right']} style={rightContainerStyle}>
        <Space align="end" direction="vertical">
          {rightNotes.map((i, x) => {
            return (
              <NoteItem
                key={`${dslStore?.currentPageId}_${x}`}
                data={i}
                index={x}
                placement={Position.Right}
                onClick={() => onSelectNote(i)}
              ></NoteItem>
            );
          })}
        </Space>
      </div>
      <div className={styles['note-display-bottom']}></div>
      <div className={styles['note-display-left']} style={leftContainerStyle}>
        <Space align="end" direction="vertical">
          {leftNotes.map((i, x) => {
            return (
              <NoteItem
                key={`${dslStore?.currentPageId}_${x}`}
                data={i}
                index={x}
                placement={Position.Left}
                onClick={() => onSelectNote(i)}
              ></NoteItem>
            );
          })}
        </Space>
      </div>
    </>
  );
});

export default observer(function NoteDisplay({ pageWidth }: NoteDisplayProps) {
  const [isRendered, setIsRendered] = useState(false);
  const editorStore = useContext(EditorStoreContext);
  const { pageRoot, isSwitching } = useIframeStore();

  const showNote = useMemo(() => editorStore.showNote, [editorStore.showNote]);

  if (!showNote) return null;

  useEffect(() => {
    if (!isSwitching && pageRoot) {
      setIsRendered(true);
    }
  }, [pageRoot, isSwitching]);


  return isRendered ? (
    <div className={styles['note-display-container']} style={{ width: pageWidth }}>
      <Note />
    </div>
  ) : (
    <div></div>
  );
});
