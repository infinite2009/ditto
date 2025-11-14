import { observer } from 'mobx-react';
import { useContext, useState } from 'react';
import { Button, Select } from 'antd';
import FormInput from '@/pages/editor/form-panel/basic-form/form-input';

import styles from './index.module.less';
import { PlusThin } from '@/components/icon';
import { EditorStoreContext } from '@/hooks/context';

export interface VariableInputProps {
  onChange: (value: string, type: InputType) => void;
  value: any;
}

export enum InputType {
  CONSTANT = 'constant',
  VARIABLE = 'variable',
}

function VariableInput({ value, onChange }: VariableInputProps) {
  const editorStore = useContext(EditorStoreContext);

  const [inputType, setInputType] = useState<InputType>(InputType.VARIABLE);

  function handleSelectingVariable(value: string) {
    onChange?.(value, InputType.VARIABLE);
  }

  function handleInputtingConstant(e: any) {
    onChange?.(e.target.value.trim(), InputType.CONSTANT);
  }

  function toggleInputType() {
    if (inputType === InputType.VARIABLE) {
      setInputType(InputType.CONSTANT);
    } else {
      setInputType(InputType.VARIABLE);
    }
  }

  function showVariableConfig() {
    editorStore.openVariableConfig();
  }

  return (
    <div className={styles.variableInput}>
      {
        inputType === InputType.VARIABLE ? (
          <Select classNames={{ root: styles.select }} value={value} onSelect={handleSelectingVariable} popupRender={menu => {
            return (
              <div className={styles.selectPopup}>
                {menu}
                <Button icon={<PlusThin />} onClick={showVariableConfig}>变量</Button>
              </div>
            );
          }}/>
        ) : (
          <FormInput value={value} onInput={handleInputtingConstant} />
        )
      }
      <Button className={styles.toggleBtn} variant="outlined" onClick={toggleInputType}>切换</Button>
    </div>
  );
}

VariableInput.displayName = 'VariableInput';

export default observer(VariableInput);
