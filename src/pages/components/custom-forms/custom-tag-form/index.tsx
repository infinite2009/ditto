import { observer } from 'mobx-react';
import { DSLStoreContext } from '@/hooks/context';
import React, { useContext } from 'react';
import { ColorPicker } from 'antd';
import { Color } from 'antd/es/color-picker';
import { ColorValueType } from 'antd/es/color-picker/interface';
import FormInput from '@/pages/editor/form-panel/basic-form/form-input';

import styles from './index.module.less';

export default observer(function CustomTagForm() {
  const dslStore = useContext(DSLStoreContext);

  const current = dslStore.selectedComponent;
  const compid = current.id;

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
    console.log('color: ', hex);
    dslStore.updateComponentProps({ color: hex });
  }

  function fetchColor() {
    return (dslStore.fetchPropsSchema(compid, 'color').value || '#2AC864') as unknown as ColorValueType;
  }

  function fetchText() {
    return current.children?.[0]?.current || '成功';
  }

  function handleChangingText(val: string) {
    return dslStore.updateComponentProps({ children: val });
  }

  console.log('current.children', current.children);

  return (
    <div className={styles.customTagForm}>
      <div className={styles.formItem}>
        <span className={styles.label}>文案</span>
        <FormInput value={fetchText() || '成功'} onChange={handleChangingText} />
      </div>
      <div className={styles.formItem}>
        <span className={styles.label}>颜色</span>
        <ColorPicker presets={presets} value={fetchColor()} onChange={handleChangingColor} />
      </div>
    </div>
  );
});
