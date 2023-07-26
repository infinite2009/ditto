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
    drop: () => {
      debugger;
      return {
        name
      };
    },
    hover: () => {
      console.log('hover');
    },
    collect: (monitor: any) => ({
      isOver: monitor.isOver(),
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

  return (
    <div
      ref={drop}
      className={styles.main}
      onClick={handleClicking}
      style={{ background: isOver ? '#f0f' : '#0ff' }}
    >
      <div style={{ height: 100, width: 100, background: '#0f0'}}></div>
    </div>
  );
}
