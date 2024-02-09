import React, { useContext } from 'react';
import { observer } from 'mobx-react';
import { DSLStoreContext } from '@/hooks/context';

import { Minus, PlusThin } from '@/components/icon';
import { message, Typography } from 'antd';
import { HighlightOutlined } from '@ant-design/icons';
import { toJS } from 'mobx';

import styles from './index.module.less';

export interface ISelectOptionsProps {
  title: string;
}

type Option = {
  label: string;
  value: string;
};

export default observer(function SelectOptions({ title = '' }: ISelectOptionsProps) {
  const dslStore = useContext(DSLStoreContext);

  function generateNewValue() {
    const { options } = dslStore.dsl.props[dslStore.selectedComponent.id];
    let nameSuffix = 1;
    const namePrefix = 'value';
    let nameExists = (options.value as Option[]).some(({ value }) => value === `${namePrefix}${nameSuffix}`);
    while (nameExists) {
      nameSuffix++;
      nameExists = (options.value as Option[]).some(({ value }) => value === `${namePrefix}${nameSuffix}`);
    }
    const newValue = `${namePrefix}${nameSuffix}`;
    return newValue;
  }

  function generateNewLabel() {
    const { options } = dslStore.dsl.props[dslStore.selectedComponent.id];
    let nameSuffix = 1;
    const namePrefix = '选项';
    let nameExists = (options.value as Option[]).some(({ label }) => label === `${namePrefix}${nameSuffix}`);
    while (nameExists) {
      nameSuffix++;
      nameExists = (options.value as Option[]).some(({ label }) => label === `${namePrefix}${nameSuffix}`);
    }
    const newLabel = `${namePrefix}${nameSuffix}`;
    return newLabel;
  }

  function handleEditingOption(text: string, key: 'label' | 'value', index: number) {
    if (!text.trim()) {
      return;
    }
    const { options } = dslStore.dsl.props[dslStore.selectedComponent.id];
    const copy = toJS(options.value);
    const alreadyExists = (copy as { label: string; value: string }[]).some(item => {
      item[key] === text.trim();
    });
    if (alreadyExists) {
      message.error(`重复的选项${key === 'label' ? '名' : '值'}`);
      return;
    }
    copy[index][key] = text.trim();
    dslStore.updateComponentProps({ options: copy }, dslStore.selectedComponent);
  }

  function removeOption(index: number) {
    const { options } = dslStore.dsl.props[dslStore.selectedComponent.id];
    const copy = toJS(options.value);
    if (!(copy as { label: string; value: string }[]).length) {
      return;
    }
    (copy as { label: string; value: string }[]).splice(index, 1);
    dslStore.updateComponentProps({ options: copy }, dslStore.selectedComponent);
  }

  function addOption() {
    const { options } = dslStore.dsl.props[dslStore.selectedComponent.id];
    const copy = toJS(options.value) || [];
    (copy as { label: string; value: string }[]).push({
      label: generateNewLabel(),
      value: generateNewValue()
    });
    dslStore.updateComponentProps({ options: copy }, dslStore.selectedComponent);
  }

  function renderOptions() {
    const { options } = dslStore.dsl.props[dslStore.selectedComponent.id];
    return ((options.value as { value: string; label: string }[]) || []).map((option, index) => {
      return (
        <div className={styles.optionContainer} key={index}>
          <div className={styles.option}>
            <span>选项名：</span>
            <Typography.Text
              editable={{
                icon: <HighlightOutlined />,
                tooltip: 'click to edit text',
                onChange: text => handleEditingOption(text, 'label', index),
                enterIcon: null
              }}
            >
              {option.label}
            </Typography.Text>
            <Minus className={styles.removeIcon} onClick={() => removeOption(index)} />
          </div>
          <div className={styles.option}>
            <span>选项值：</span>
            <Typography.Text
              editable={{
                icon: <HighlightOutlined />,
                tooltip: 'click to edit text',
                onChange: text => handleEditingOption(text, 'value', index),
                enterIcon: null
              }}
            >
              {option.value}
            </Typography.Text>
          </div>
        </div>
      );
    });
  }

  return (
    <div className={styles.selectOptions}>
      <div className={styles.header}>
        <span>{title}</span>
        <PlusThin className={styles.addIcon} onClick={addOption} />
      </div>
      {renderOptions()}
    </div>
  );
});
