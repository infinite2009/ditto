import { observer } from 'mobx-react';
import { useContext } from 'react';
import { DSLStoreContext } from '@/hooks/context';
import { Minus, PlusThin } from '@/components/icon';
import { toJS } from 'mobx';

import styles from './index.module.less';

const CustomListForm = observer(() => {
  const dslStore = useContext(DSLStoreContext);

  function removeDataItem(index: number) {
    const { dataSource } = dslStore.dsl.props[dslStore.selectedComponent.id];
    const copy = toJS(dataSource.value);
    (copy as Record<string, any>[]).splice(index, 1);
    // 重排索引
    (copy as Record<string, any>[]).forEach((item, index) => {
      item.index = index;
    });
    const list = dslStore.dsl.componentIndexes[dslStore.selectedComponent.id].children;
    dslStore.dangerousDeleteComponent(list[index].current, () => {
      dslStore.updateComponentProps({ dataSource: copy }, dslStore.selectedComponent);
    });
  }

  function addDataItem() {
    const { dataSource } = dslStore.dsl.props[dslStore.selectedComponent.id];
    const copy = toJS(dataSource.value);
    (copy as Record<string, any>[]).push({ index: (copy as Record<string, any>[]).length });
    dslStore.dangerousInsertComponent(dslStore.selectedComponent.id, 'HorizontalFlex', 'antd', -1, undefined, () => {
      dslStore.updateComponentProps({ dataSource: copy }, dslStore.selectedComponent);
    });
  }

  function renderListItems() {
    const { dataSource } = dslStore.dsl.props[dslStore.selectedComponent.id];
    return (dataSource.value as Record<string, any>[]).map((item, index) => {
      return (
        <div key={index}>
          <span>数据项{index + 1}</span>
          <Minus className={styles.removeIcon} onClick={() => removeDataItem(index)} />
        </div>
      );
    });
  }

  return (
    <div>
      <div className={styles.header}>
        <PlusThin className={styles.addIcon} onClick={addDataItem} />
      </div>
      {renderListItems()}
    </div>
  );
});

export default CustomListForm;
