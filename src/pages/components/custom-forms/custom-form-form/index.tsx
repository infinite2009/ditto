import { Minus } from '@/components/icon';
import style from './index.module.less';
import { observer } from 'mobx-react';
import { useContext } from 'react';
import { DSLStoreContext } from '@/hooks/context';

export default observer(function CustomFormForm() {
  const dslStore = useContext(DSLStoreContext);
  function removeFormItem() {}

  function renderFormItems() {
    const component = dslStore.selectedComponent;
    if (!component) {
      return null;
    }
  }

  return (
    <div className={style.form}>
      <div className={style.addItem}>
        <span className={style.title}>表单项</span>
        <Minus className={style.removeIcon} onClick={removeFormItem} />
      </div>
      <div className={style.draggableForm}>{renderFormItems()}</div>
    </div>
  );
});
