import { message } from 'antd';
import styles from './index.module.less';
import { ReactNode } from 'react';
import { useDrag } from 'react-dnd';
import IComponentConfig from '@/types/component-config';

interface DropResult {
  allowedDropEffect: string;
  dropEffect: string;
  name: string;
}

export interface IEditorWrapper {
  name: string;
  children: ReactNode;
}

export default function DraggableComponent({ name, children }: IEditorWrapper) {
  const [{ opacity }, drag] = useDrag<any, any, any>(() => {
    return {
      type: 'component',
      item: { name },
      end(item, monitor) {
        const dropResult = monitor.getDropResult() as DropResult;
        if (item && dropResult) {
          let alertMessage = '';
          const isDropAllowed =
            dropResult.allowedDropEffect === 'any' || dropResult.allowedDropEffect === dropResult.dropEffect;

          if (isDropAllowed) {
            const isCopyAction = dropResult.dropEffect === 'copy';
            const actionName = isCopyAction ? 'copied' : 'moved';
            alertMessage = `You ${actionName} ${item.name} into ${dropResult.name}!`;
          } else {
            alertMessage = `You cannot ${dropResult.dropEffect} an item into the ${dropResult.name}`;
          }
          alert(alertMessage);
        }
      }
    };
  }, [name]);

  function handleClicking() {
    message.success('点击编辑器');
  }

  return children ? (
    <div className={styles.main} ref={drag} onClick={handleClicking} style={{ opacity }}>
      {children}
    </div>
  ) : (
    <div>无效的组件信息</div>
  );
}
