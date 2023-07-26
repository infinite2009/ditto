import { message } from 'antd';
import styles from './index.module.less';
import { ReactNode, useEffect, useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import IComponentConfig from '@/types/component-config';

interface DropResult {
  dropEffect: string;
  name: string;
}

export interface IEditorWrapper {
  name: string;
  children: ReactNode;
}

export default function EditWrapper({ name, children }: IEditorWrapper) {
  const divRef = useRef(null);
  const [{ canDrop, isOver }, drop] = useDrop(() => ({
    accept: 'component',
    drop: (_item, monitor) => {
      const didDrop = monitor.didDrop();
      if (!didDrop) {
        message.success('dsl 插入中');
        return {
          name
        };
      }
    },
    collect: (monitor: any) => ({
      isOver: monitor.isOver({ shallow: true }),
      canDrop: monitor.canDrop()
    })
  }));

  useEffect(() => {
    if (divRef.current) {
      const config = { childList: true };
      const ob = new MutationObserver((mutationList, observer) => {
        for (const mutation of mutationList) {
          if (mutation.type === 'childList') {
            console.log('A child node has been added or removed.');
          } else if (mutation.type === 'attributes') {
            console.log(`The ${mutation.attributeName} attribute was modified.`);
          }
        }
      });
      ob.observe(divRef.current, config);
      return () => {
        ob.disconnect();
      };
    }
  }, []);

  function handleClicking(e: { stopPropagation: () => void }) {
    e.stopPropagation();
    message.success(`点击编辑器：${name}`);
  }

  // drop(divRef);

  return children ? (
    <div
      ref={drop}
      className={styles.main}
      onClick={handleClicking}
      style={{ background: isOver ? '#0ff' : 'initial' }}
    >
      {children}
    </div>
  ) : <div>无效的组件</div>;
}
