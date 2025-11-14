import { observer } from 'mobx-react';
import { DSLStoreContext } from '@/hooks/context';
import { useContext } from 'react';
import { ColorPicker } from 'antd';
import { Color } from 'antd/es/color-picker';
import { ColorValueType } from 'antd/es/color-picker/interface';

import styles from './index.module.less';

export default observer(function CustomPopoverForm() {
  const dslStore = useContext(DSLStoreContext);
  const presets = [
    {
      label: '成功',
      colors: ['#2AC864', '#0EB350', '#2AC864BF', '#2AC86480', '#2AC86414'],
      defaultOpen: true
    },
    {
      label: '警示',
      colors: ['#FF7F24', '#E95B03', '#FF7F24BF', '#FF7F2480', '#FF7F2414'],
      defaultOpen: true
    },
    {
      label: '错误',
      colors: ['#F85A54', '#E23D3D', '#F85A54BF', '#F85A5480', '#F85A5414'],
      defaultOpen: true
    }
  ];

  function handleChangingColor(_: Color, hex: string) {
    dslStore.updateComponentProps({ color: hex });
  }

  function fetchColor() {
    return (dslStore.fetchPropsSchema(null, 'color').value || '#2AC864') as unknown as ColorValueType;
  }

  return (
    <div className={styles.customPopoverForm}>
      <div className={styles.formItem}>
        <span className={styles.label}>背景颜色：</span>
        <ColorPicker presets={presets} value={fetchColor()} onChange={handleChangingColor} />
      </div>
    </div>
  );
});
