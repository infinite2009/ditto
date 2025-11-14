import { NoteItem } from '@/service/editor-store';
import { Card } from 'antd';
import { observer } from 'mobx-react';
import { CSSProperties, MouseEventHandler, useContext, useEffect, useMemo, useRef, useState } from 'react';
import ConnectionLine from './ConnectionLine';
import { DSLStoreContext, EditorStoreContext } from '@/hooks/context';
import { useMutationObserver } from 'ahooks';
import { getBezierPath, Position } from '@xyflow/react';
import { Expand } from '@/components/icon';
import { calcContainerStyle, calcOffset, calcPoint } from './utils';
import useIframeStore from '@/iframe/store';

export interface NoteItemProps {
  index: number;
  data: NoteItem;
  placement: Position;
  onClick?: MouseEventHandler;
}

export default observer(function NoteItem({ index, data, placement, onClick }: NoteItemProps) {
  const ref = useRef<HTMLDivElement>(null);
  const dslStore = useContext(DSLStoreContext);
  const editorStore = useContext(EditorStoreContext);
  const [containerHeight, setContainerHeight] = useState<number>();
  const startEl = document.querySelector(`[data-voltron-hidden-id=${data.componentId}]`);

  const [startRect, setStartRect] = useState<DOMRect>(new DOMRect(0, 0, 0, 0));
  const [endRect, setEndRect] = useState<DOMRect>(new DOMRect(0, 0, 0, 0));

  const isSelected = dslStore.selectedComponent.id === data.componentId;

  const targetPosition = useMemo(() => {
    return {
      [Position.Top]: Position.Bottom,
      [Position.Bottom]: Position.Top,
      [Position.Left]: Position.Right,
      [Position.Right]: Position.Left
    }[placement];
  }, [placement]);

  const delta = useMemo(() => {
    return calcOffset({ startRect, endRect, placement, scale: editorStore.scale });
  }, [startRect, endRect, placement]);

  const points = useMemo(() => {
    return calcPoint({ placement, delta });
  }, [
    // containerHeight,
    delta,
    placement
  ]);

  const containerStyle = useMemo<CSSProperties>(() => {
    return calcContainerStyle({
      placement,
      delta,
      endRect,
      scale: editorStore.scale
    });
  }, [delta, endRect, placement]);

  const [path, labelX, labelY] = getBezierPath({
    sourceX: points.start.x,
    sourceY: points.start.y,
    sourcePosition: placement,
    targetX: points.end.x,
    targetY: points.end.y,
    targetPosition
  });

  const onResize = () => {
    setStartRect(startEl?.getBoundingClientRect());
    setEndRect(ref.current?.getBoundingClientRect?.());
    setContainerHeight(ref.current?.offsetHeight);
  };

  useEffect(() => {
    window.addEventListener('resize', onResize);

    Promise.resolve().then(() => {
      onResize();
    });
    return () => {
      window.removeEventListener('resize', onResize);
    };
  }, [startEl, data]);

  return (
    <div ref={ref} style={{ position: 'relative' }} onClick={onClick}>
      <Card
        key={index}
        hoverable
        style={{
          width: 400,
          cursor: 'pointer',
          pointerEvents: 'all'
        }}
      >
        <div dangerouslySetInnerHTML={{ __html: data.noteData }}></div>
      </Card>
      {startEl && (
        <>
          <ConnectionLine
            width={Math.abs(delta.x)}
            height={Math.abs(delta.y)}
            style={{
              position: 'absolute',
              zIndex: 99,
              ...containerStyle
            }}
            svg={{
              path,
              strokeWidth: isSelected ? 1 : 0.5,
              stroke: isSelected ? '#00AEEC' : 'rgba(0, 0, 0, 0.8)',
              strokeDasharray: data.componentId === 'PageRoot0' ? '' : '4 4'
            }}
            animated={data.componentId !== 'PageRoot0' && isSelected}
          ></ConnectionLine>
          {isSelected && (
            <div
              style={{
                color: '#00AEEC',
                fontSize: 14
              }}
            >
              {placement === Position.Right && (
                <div
                  style={{
                    position: 'absolute',
                    zIndex: '100',
                    top: '50%',
                    left: 4,
                    transform: 'translate(-100%, -50%)'
                  }}
                >
                  <Expand></Expand>
                </div>
              )}
              {placement === Position.Left && (
                <div
                  style={{
                    position: 'absolute',
                    zIndex: '100',
                    top: '50%',
                    right: 4,
                    transform: 'translate(100%, -50%) rotate(180deg)'
                  }}
                >
                  <Expand></Expand>
                </div>
              )}
              {placement === Position.Top && (
                <div
                  style={{
                    position: 'absolute',
                    zIndex: '100',
                    bottom: 10,
                    left: '50%',
                    transform: 'translate(-50%, 100%) rotate(-90deg)'
                  }}
                >
                  <Expand></Expand>
                </div>
              )}
              {/* {placement === Position.Bottom && (
                <div
                  style={{
                    position: 'absolute',
                    zIndex: '100',
                    bottom: 10,
                    left: '50%',
                    transform: 'translate(-50%, 100%) rotate(90deg)'
                  }}
                >
                  <Expand></Expand>
                </div>
              )} */}
            </div>
          )}
        </>
      )}
    </div>
  );
});
