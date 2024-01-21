import { useEffect } from 'react';
import styles from '../index.module.less';
import { observer } from 'mobx-react';

export interface IDraggableFormItemProps {
  schema: {
    component: string;
  }[];
}

export default observer(function DraggableFormItem() {
  useEffect(() => {}, []);

  return <div className={styles.draggableForm}></div>;
});
