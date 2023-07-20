
import Toolbar from '@/pages/editor/toolbar';

import styles from './index.module.css';

export default function Editor() {
  return <div>
    <Toolbar />
    <div>
      <div className={style.panel}></div>
    </div>
  </div>;
}