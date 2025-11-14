import React from 'react';

import { observer } from 'mobx-react';
import { PlusThin } from '@/components/icon';

import customFormStyle from '../../index.module.less';

const ROW_SPAN_SIZE = 24;
const DEFAULT_SPAN_SIZE_PER_COLUMN = 6;

export default observer(function CustomFormForm() {
  const addButton = () => {};

  return (
    <div className={customFormStyle.form}>
      <div className={customFormStyle.addItem}>
        <span className={customFormStyle.title}>表单项</span>
        <PlusThin className={customFormStyle.addIcon} onClick={addButton} />
      </div>
      <div className={customFormStyle.draggableForm}>{}</div>
    </div>
  );
});
